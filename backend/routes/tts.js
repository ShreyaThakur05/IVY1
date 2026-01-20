import express from "express";
import { getVoiceId } from "../services/voiceStorage.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text, voice_id, persona_name } = req.body;
    console.log(`[TTS] Request: text="${text?.substring(0, 50)}...", persona="${persona_name}"`);

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Check if ElevenLabs API key exists
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('[TTS] No ElevenLabs API key found');
      return res.status(500).json({ error: "TTS service not configured" });
    }

    // Try to find custom voice for persona
    let finalVoiceId = voice_id || getVoiceId(persona_name);
    
    console.log(`[TTS] Using voice: ${finalVoiceId} for ${persona_name || 'default'}`);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5'
      })
    });

    console.log(`[TTS] ElevenLabs response: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TTS] ElevenLabs error: ${response.status} - ${errorText}`);
      
      // Try with default voice as fallback
      if (finalVoiceId !== '21m00Tcm4TlvDq8ikWAM') {
        console.log('[TTS] Trying with default voice as fallback');
        const fallbackResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_turbo_v2_5'
          })
        });
        
        if (fallbackResponse.ok) {
          const audioBuffer = await fallbackResponse.arrayBuffer();
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.send(Buffer.from(audioBuffer));
        }
      }
      
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get the audio buffer and send it
    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error("[TTS] Error:", error.message);
    res.status(500).json({ error: `Failed to generate speech: ${error.message}` });
  }
});

export default router;