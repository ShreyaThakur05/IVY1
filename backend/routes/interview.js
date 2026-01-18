import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { createRequire } from 'module';
import { createInterviewSession, getSession, addHistory } from "../services/interviewSession.js";
import { transcribeAudio, generateRAGResponse } from "../services/openaiService.js";
import { setVoicePersona } from "../services/voiceStorage.js";

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse').default || require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();

// Enhanced multer setup with better file handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir())
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${file.fieldname}-${timestamp}${ext}`)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio_file') {
      // Accept all audio formats
      if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'));
      }
    } else if (file.fieldname === 'source_file') {
      // Accept document formats
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Cleanup function for temp files
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up temp file: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Extract text from uploaded files with better error handling
async function extractTextFromFile(filePath, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (mimetype === 'text/plain') {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
  } catch (error) {
    console.error('File extraction error:', error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

// 1. START INTERVIEW
router.post("/start", upload.single('source_file'), async (req, res) => {
  try {
    // DETAILED DEBUGGING - Log everything received
    console.log('\n=== START INTERVIEW REQUEST DEBUG ===');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file ? { filename: req.file.filename, size: req.file.size } : 'No file');
    console.log('req.body.persona_name:', JSON.stringify(req.body.persona_name));
    console.log('req.body.interview_topic:', JSON.stringify(req.body.interview_topic));
    console.log('typeof persona_name:', typeof req.body.persona_name);
    console.log('typeof interview_topic:', typeof req.body.interview_topic);
    console.log('persona_name length:', req.body.persona_name?.length);
    console.log('interview_topic length:', req.body.interview_topic?.length);
    console.log('=====================================\n');
    
    const { persona_name, interview_topic } = req.body;
    
    // More specific validation with detailed error messages
    if (!persona_name) {
      console.log('❌ VALIDATION FAILED: persona_name is missing or falsy');
      return res.status(400).json({ error: "Missing persona_name" });
    }
    
    if (!interview_topic) {
      console.log('❌ VALIDATION FAILED: interview_topic is missing or falsy');
      return res.status(400).json({ error: "Missing interview_topic" });
    }
    
    if (typeof persona_name !== 'string' || persona_name.trim() === '') {
      console.log('❌ VALIDATION FAILED: persona_name is not a valid string');
      return res.status(400).json({ error: "Invalid persona_name" });
    }
    
    if (typeof interview_topic !== 'string' || interview_topic.trim() === '') {
      console.log('❌ VALIDATION FAILED: interview_topic is not a valid string');
      return res.status(400).json({ error: "Invalid interview_topic" });
    }
    
    console.log(`✅ VALIDATION PASSED - Starting interview for persona: ${persona_name}, topic: ${interview_topic}`);
    
    let context = `Topic: ${interview_topic}`;

    // Extract text if file provided
    if (req.file) {
      console.log(`[START] Processing source file: ${req.file.filename}`);
      try {
        const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
        if (extractedText && extractedText.trim()) {
          context += `\n\nSOURCE CONTENT:\n${extractedText}`;
          console.log(`[START] Extracted ${extractedText.length} characters from source file`);
        } else {
          console.warn('[START] No text extracted from source file');
        }
      } catch (error) {
        console.error('[START] File processing error:', error);
        return res.status(400).json({ error: `File processing failed: ${error.message}` });
      } finally {
        cleanupFile(req.file.path);
      }
    }

    const sessionId = createInterviewSession({ persona_name, context });
    if (!sessionId) {
      throw new Error('Failed to create interview session');
    }
    console.log(`[START] Created session: ${sessionId}`);
    
    // Generate opening question with error handling
    try {
      const openingMsg = await generateRAGResponse(context, [], "Start the interview. Welcome me warmly and ask me to introduce myself. Keep it under 30 words.");
      addHistory(sessionId, 'assistant', openingMsg);
      
      console.log(`[START] Generated opening: ${openingMsg}`);

      res.json({
        session_id: sessionId,
        message: openingMsg,
        detected_topic: interview_topic,
        status: "started"
      });
    } catch (error) {
      console.error('[START] AI generation error:', error);
      const fallbackMsg = `Hello! I'm ${persona_name}. Let's start your ${interview_topic} interview. Please introduce yourself.`;
      addHistory(sessionId, 'assistant', fallbackMsg);
      
      res.json({
        session_id: sessionId,
        message: fallbackMsg,
        detected_topic: interview_topic,
        status: "started"
      });
    }

  } catch (error) {
    console.error("[START] Error:", error);
    res.status(500).json({ error: error.message || 'Failed to start interview' });
  }
});

// 2. CHAT (VOICE-TO-VOICE) with enhanced error handling
router.post("/chat", upload.single('audio_file'), async (req, res) => {
  const { session_id } = req.body;
  const audioFile = req.file;
  
  console.log(`[CHAT] Received request - session_id: ${session_id}, audio file: ${audioFile ? 'present' : 'missing'}`);

  if (!session_id || !audioFile) {
    return res.status(400).json({ error: "Missing session_id or audio_file" });
  }

  try {
    const session = getSession(session_id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // A. Transcribe with better error handling
    let userText;
    try {
      console.log(`[CHAT] Transcribing audio file: ${audioFile.path}`);
      userText = await transcribeAudio(audioFile.path);
      console.log(`🎤 User said: "${userText}"`);
      
      if (!userText || userText.trim() === '') {
        userText = "I'm ready to continue with the interview.";
      }
    } catch (error) {
      console.error('[CHAT] Transcription error:', error);
      userText = "I'm ready to continue with the interview.";
    } finally {
      cleanupFile(audioFile.path);
    }

    addHistory(session_id, 'user', userText);

    // B. Generate AI Response with fallback
    let aiText;
    try {
      console.log(`[CHAT] Generating AI response...`);
      aiText = await generateRAGResponse(session.context, session.history, userText);
      console.log(`🤖 AI replied: "${aiText}"`);
    } catch (error) {
      console.error('[CHAT] AI generation error:', error);
      aiText = "That's interesting. Could you tell me more about your experience with that?";
    }
    
    addHistory(session_id, 'assistant', aiText);

    res.json({
      message: aiText,
      transcription: userText,
      session_id: session_id
    });

  } catch (error) {
    console.error("[CHAT] Error:", error);
    res.status(500).json({ error: "Processing failed" });
  }
});

// 3. VOICE CLONING with enhanced error handling
router.post("/clone-voice", upload.single('audio_file'), async (req, res) => {
  const audioFile = req.file;
  
  try {
    const { user_id, voice_name, persona_id } = req.body;

    if (!audioFile) {
      return res.status(400).json({ error: "Audio file is required" });
    }
    
    if (!voice_name || !persona_id) {
      return res.status(400).json({ error: "Missing voice_name or persona_id" });
    }

    console.log(`[CLONE] Starting clone for voice: ${voice_name}`);
    console.log(`[CLONE] Audio file: ${audioFile.path}, size: ${audioFile.size}`);
    
    // Use ElevenLabs voice cloning with proper form-data
    try {
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      formData.append('name', voice_name);
      formData.append('description', `Custom voice for ${voice_name}`);
      
      // Read file as buffer and append with proper filename
      const fileBuffer = fs.readFileSync(audioFile.path);
      const fileName = audioFile.originalname || 'voice_sample.webm';
      formData.append('files', fileBuffer, {
        filename: fileName,
        contentType: audioFile.mimetype || 'audio/webm'
      });

      const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          ...formData.getHeaders()
        },
        body: formData
      });

      console.log(`[CLONE] ElevenLabs response status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        const voiceId = result.voice_id;
        
        console.log(`[CLONE] SUCCESS! Created voice ID: ${voiceId}`);
        
        // Store the mapping using voice_name as key
        setVoicePersona(voice_name, {
          voice_id: voiceId,
          name: voice_name,
          persona_id: persona_id,
          created_at: Date.now()
        });
        
        res.json({ status: "success", voice_id: voiceId });
      } else {
        const errorText = await response.text();
        console.log(`[CLONE] ElevenLabs error: ${errorText}`);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
    } catch (error) {
      console.log(`[CLONE] ElevenLabs failed: ${error.message}, using fallback`);
      
      const defaultVoiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice as fallback
      
      setVoicePersona(voice_name, {
        voice_id: defaultVoiceId,
        name: voice_name,
        persona_id: persona_id,
        created_at: Date.now(),
        fallback: true
      });
      
      res.json({ status: "success", voice_id: defaultVoiceId, fallback: true });
    }

  } catch (error) {
    console.error("[CLONE] Error:", error);
    res.status(500).json({ error: error.message || 'Voice cloning failed' });
  } finally {
    if (audioFile) {
      cleanupFile(audioFile.path);
    }
  }
});

// 4. ANALYZE INTERVIEW
router.post("/analyze", async (req, res) => {
  try {
    const { session_id } = req.body;
    
    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }
    
    const session = getSession(session_id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    console.log(`[ANALYZE] Starting analysis for session: ${session_id}`);
    
    // Create analysis prompt
    const conversation = session.history.map(msg => 
      `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
    ).join('\n\n');
    
    const analysisPrompt = `Analyze this interview conversation and provide detailed feedback:

${conversation}

Provide analysis in this format:
- Overall Score (1-10): [score]
- Strengths: [list key strengths]
- Areas for Improvement: [specific areas to improve]
- Detailed Feedback: [comprehensive feedback]

Focus on communication skills, technical knowledge, problem-solving approach, and interview performance.`;
    
    const analysis = await generateRAGResponse("", [], analysisPrompt);
    
    // Parse analysis (simplified)
    const scoreMatch = analysis.match(/Overall Score.*?(\d+)/i);
    const overall_score = scoreMatch ? parseInt(scoreMatch[1]) : 7;
    
    const result = {
      session_id,
      overall_score,
      analysis: analysis,
      strengths: "Good communication and clear explanations",
      improvements: "Provide more specific examples and technical details",
      conversation_history: session.history,
      analyzed_at: new Date().toISOString()
    };
    
    console.log(`[ANALYZE] Analysis complete with score: ${overall_score}/10`);
    res.json(result);
    
  } catch (error) {
    console.error("[ANALYZE] Error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;