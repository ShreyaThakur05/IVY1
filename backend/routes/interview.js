import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { createRequire } from 'module';
import { createInterviewSession, getSession, addHistory, getSessionHistory } from "../services/interviewSession.js";
import { transcribeAudio, generateRAGResponse } from "../services/openaiService.js";
import { setVoicePersona } from "../services/voiceStorage.js";
import { conversationFlow } from "../services/conversationFlow.js";

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
    console.log('\n=== START INTERVIEW REQUEST DEBUG ===');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file ? { filename: req.file.filename, size: req.file.size } : 'No file');
    console.log('=====================================\n');
    
    const { persona_name, interview_topic, user_id } = req.body;
    
    if (!persona_name || !interview_topic || !user_id) {
      return res.status(400).json({ error: "Missing required fields: persona_name, interview_topic, user_id" });
    }
    
    console.log(`✅ Starting interview for user: ${user_id}, persona: ${persona_name}, topic: ${interview_topic}`);
    
    let primary_topic = interview_topic;
    let document_reference = null;

    // Extract text if file provided
    if (req.file) {
      console.log(`[START] Processing source file: ${req.file.filename}`);
      try {
        const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
        if (extractedText && extractedText.trim()) {
          document_reference = req.file.originalname;
          primary_topic = `${interview_topic} (Document: ${req.file.originalname})`;
          console.log(`[START] Extracted ${extractedText.length} characters from source file`);
        }
      } catch (error) {
        console.error('[START] File processing error:', error);
        return res.status(400).json({ error: `File processing failed: ${error.message}` });
      } finally {
        cleanupFile(req.file.path);
      }
    }

    const sessionId = await createInterviewSession({ 
      user_id, 
      persona_name, 
      primary_topic
    });
    
    if (!sessionId) {
      throw new Error('Failed to create interview session');
    }
    console.log(`[START] Created session: ${sessionId}`);
    
    // Initialize conversation flow
    conversationFlow.initializeSession(sessionId, persona_name);
    
    // Generate opening question
    try {
      const openingMsg = await generateRAGResponse(
        `Topic: ${primary_topic}`, 
        [], 
        "Start the interview. Welcome me warmly and ask me to introduce myself. Keep it under 30 words.",
        sessionId,
        persona_name
      );
      await addHistory(sessionId, 'assistant', openingMsg);
      
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
      await addHistory(sessionId, 'assistant', fallbackMsg);
      
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
    const session = await getSession(session_id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Get conversation history
    const history = await getSessionHistory(session_id);

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

    await addHistory(session_id, 'user', userText);

    // Process user input through conversation flow
    conversationFlow.processUserInput(session_id, userText);

    // B. Generate AI Response with fallback
    let aiText;
    try {
      console.log(`[CHAT] Generating AI response...`);
      const context = `Topic: ${session.primary_topic || session.title}`;
      aiText = await generateRAGResponse(context, history, userText, session_id, session.persona_name);
      console.log(`🤖 AI replied: "${aiText}"`);
    } catch (error) {
      console.error('[CHAT] AI generation error:', error);
      aiText = "That's interesting. Could you tell me more about your experience with that?";
      conversationFlow.processAIResponse(session_id, aiText);
    }
    
    await addHistory(session_id, 'assistant', aiText);

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
    
    const session = await getSession(session_id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    console.log(`[ANALYZE] Starting analysis for session: ${session_id}`);
    
    // Get conversation history
    const history = await getSessionHistory(session_id);
    
    // Create analysis prompt
    const conversation = history.map(msg => 
      `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
    ).join('\n\n');
    
    const analysisPrompt = `You are an adaptive interview evaluator and conversational AI conducting and analyzing a speech-to-speech interview on a fixed topic or an uploaded reference document.

Your behavior must be dynamic, context-aware, and evidence-driven.

🚨 Score Scale Enforcement
The final score MUST be out of 100
You are strictly forbidden from:
- Using /10, /5, or mixed scales
- Writing outputs like 64/10
Any score must be displayed as: Final Score: XX / 100

🔍 Content Presence Validation (Critical)
Before assigning any meaningful score, you MUST first validate:
Did the candidate actually speak about the topic or document content?

Apply this decision flow before scoring:
- No topical content detected → Cap score at 0–15 / 100, Skip depth-based evaluation
- Minimal topical mention (very shallow) → Cap score at 30 / 100
- Clear topical engagement → Full scoring allowed

This gating must influence all parameters.

🎯 Scoring Rules (Strict)
Scores must be:
- Evidence-based
- Proportional to content quality
- Impossible to reach "average" without substance

DO NOT:
- Default to mid-range scores
- Reward participation alone
- Reuse previous session scores

📊 Evaluation Parameters (Adaptive Use)
Score each parameter out of 10, then apply the weight:

1. Topic Understanding & Accuracy (20%)
2. Spoken Clarity & Articulation (15%)
3. Communication Structure (15%)
4. Depth of Explanation (15%)
5. Responsiveness to Questions (10%)
6. Verbal Confidence & Fluency (10%)
7. Conversational Adaptability (10%)
8. Filler & Noise Management (5%)

📝 Analysis Report Requirements
The final report MUST:
- Show non-uniform scoring unless justified by evidence
- Reference specific moments or responses from the conversation
- Include unique strengths observed and unique improvement areas discovered
- Template-style feedback is explicitly disallowed

CONVERSATION TRANSCRIPT:
${conversation}

Provide your analysis in this exact format:
Final Score: [score] / 100
Strengths: [specific strengths with evidence from conversation]
Areas for Improvement: [actionable improvements with conversation references]
Detailed Analysis: [parameter-by-parameter breakdown with specific scores and conversation-based justifications]`;
    
    const analysis = await generateRAGResponse("", [], analysisPrompt);
    
    // Parse analysis (improved parsing for Final Score format)
    const scoreMatch = analysis.match(/Final Score:\s*(\d+)\s*\/\s*100/i);
    const overall_score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    
    // Extract sections
    const strengthsMatch = analysis.match(/Strengths:\s*([^\n]*(?:\n(?!Areas for Improvement|Detailed Analysis)[^\n]*)*)/i);
    const improvementsMatch = analysis.match(/Areas for Improvement:\s*([^\n]*(?:\n(?!Detailed Analysis)[^\n]*)*)/i);
    
    const result = {
      session_id,
      overall_score,
      analysis: analysis,
      strengths: strengthsMatch ? strengthsMatch[1].trim() : "Communication skills demonstrated",
      improvements: improvementsMatch ? improvementsMatch[1].trim() : "Focus on providing more detailed explanations",
      conversation_history: history,
      analyzed_at: new Date().toISOString()
    };
    
    console.log(`[ANALYZE] Analysis complete with score: ${overall_score}/100`);
    res.json(result);
    
  } catch (error) {
    console.error("[ANALYZE] Error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;