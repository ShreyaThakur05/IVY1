from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
from dotenv import load_dotenv
import google.generativeai as genai
from openai import OpenAI
from elevenlabs.client import ElevenLabs
import json
import time
from datetime import datetime
import io

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Clients
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
elevenlabs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

# In-memory storage (replace with database in production)
conversation_history = {}
voice_personas = {}
user_sessions = {}

PERSONA_PROMPTS = {
    "Shambhu": "You are Shambhu, a Technical Lead conducting an interview. Ask relevant questions based on the interview topic. Be professional and thorough. Add emotional context like 'I need to understand this better' or 'That's interesting, tell me more' to make responses more natural. Keep responses under 40 words.",
    "Shreyas": "You are Shreyas, an HR Director conducting an interview. Focus on behavioral questions and cultural fit based on the role. Be warm but professional. Use encouraging phrases like 'That sounds great' or 'I'm curious about...' to create rapport. Keep responses under 40 words.", 
    "Shreya": "You are Shreya, a Product Manager conducting an interview. Ask about product thinking, strategy, and user focus based on the role. Be analytical and engaging. Express enthusiasm with phrases like 'Excellent point!' or 'Let's dive deeper into...' Keep responses under 40 words."
}

@app.post("/api/voice/clone")
async def clone_voice(
    user_id: str = Form(...),
    voice_name: str = Form(...),
    persona_name: str = Form(...),
    audio_file: UploadFile = File(...)
):
    try:
        print(f"Cloning voice '{voice_name}' for persona '{persona_name}'...")
        content = await audio_file.read()
        print(f"Received audio file: {len(content)} bytes, filename: {audio_file.filename}")
        
        if len(content) < 1000:  # Less than 1KB
            raise HTTPException(status_code=400, detail="Audio file too small")
        
        try:
            # Save audio temporarily for ElevenLabs
            file_extension = audio_file.filename.split('.')[-1] if '.' in audio_file.filename else 'wav'
            temp_file = f"temp_voice_{int(time.time())}.{file_extension}"
            with open(temp_file, "wb") as f:
                f.write(content)
            
            print(f"Saved temp file: {temp_file}")
            
            # Clone voice with file path using stable API
            voice = elevenlabs_client.clone(
                name=voice_name,
                description=f"Custom voice for {voice_name}",
                files=[temp_file]
            )
            voice_id = voice.voice_id
            print(f"Voice cloned: {voice_id}")
            
            # Clean up temp file
            os.remove(temp_file)
            
        except Exception as e:
            print(f"ElevenLabs error: {e}")
            voice_id = "21m00Tcm4TlvDq8ikWAM"
        
        # Store voice using the voice name for correct lookup
        voice_personas[voice_name] = {
            "voice_id": voice_id,
            "voice_name": voice_name,
            "user_id": user_id,
            "persona_name": persona_name,
            "created_at": datetime.now().isoformat()
        }
        
        print(f"Stored voice '{voice_name}' (for persona '{persona_name}'): {voice_id}")
        return {"voice_id": voice_id, "persona": voice_name, "status": "success"}
        
    except Exception as e:
        print(f"Clone error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def handle_chat(
    session_id: str = Form(...),
    persona: str = Form(...),
    user_id: str = Form(...),
    interview_topic: str = Form("General Interview"),
    audio_file: UploadFile = File(...)
):
    try:
        print(f"Chat request: {persona} for {interview_topic}")
        
        # 1. Transcribe User Audio (OpenAI Whisper)
        content = await audio_file.read()
        print(f"Audio: {len(content)} bytes")
        
        try:
            # Use OpenAI Whisper for transcription
            audio_file = ("audio.wav", content, "audio/wav")
            transcript = openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
            user_text = transcript.text
            print(f"User: {user_text}")
            
        except Exception as e:
            print(f"Transcription error: {e}")
            user_text = "I'm ready for the interview"

        # 2. Get conversation context
        if session_id not in conversation_history:
            conversation_history[session_id] = []
        
        history = conversation_history[session_id]
        
        # Build conversation context for AI
        context_messages = []
        for msg in history[-6:]:  # Last 3 exchanges
            context_messages.append(f"{msg['role'].title()}: {msg['content']}")
        
        conversation_context = "\n".join(context_messages) if context_messages else "This is the start of the interview."
        
        # Generate intelligent follow-up question
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            if len(history) == 0:
                prompt = f"""You are {persona}, conducting a {interview_topic} interview.
                
The candidate just said: "{user_text}"

This is the very beginning of the interview. Welcome them warmly and ask your first relevant question about their background or experience related to {interview_topic}.

Keep your response under 35 words and make it conversational."""
            
            else:
                prompt = f"""You are {persona}, conducting a {interview_topic} interview.

CONVERSATION SO FAR:
{conversation_context}

CANDIDATE JUST SAID: "{user_text}"

Based on what they SPECIFICALLY said, ask ONE relevant follow-up question that:
1. Directly addresses their answer
2. Digs deeper into what they mentioned
3. Is relevant to the {interview_topic} role
4. Sounds natural and conversational

Keep it under 35 words. DO NOT repeat previous questions."""
            
            response = model.generate_content(prompt)
            ai_text = response.text.strip()
            print(f"AI response: '{ai_text}'")
            
        except Exception as e:
            print(f"AI generation error: {e}")
            ai_text = f"Tell me about your experience with {interview_topic}. What projects have you worked on?"

        # 4. Store conversation
        conversation_history[session_id].extend([
            {"role": "user", "content": user_text, "timestamp": datetime.now().isoformat()},
            {"role": "assistant", "content": ai_text, "timestamp": datetime.now().isoformat()}
        ])

        # 5. Get voice ID for this persona
        voice_id = "21m00Tcm4TlvDq8ikWAM"  # Default ElevenLabs voice
        
        print(f"Looking for voice for persona: '{persona}'")
        print(f"Available voices: {list(voice_personas.keys())}")
        
        if persona in voice_personas:
            voice_id = voice_personas[persona]['voice_id']
            print(f"Using custom voice for {persona}: {voice_id}")
        else:
            print(f"No custom voice for '{persona}', using default")

        # 6. Generate speech with correct voice
        try:
            print(f"Generating TTS with voice: {voice_id}")
            print(f"Text to speak: '{ai_text}'")
            
            # Use the stable ElevenLabs client method
            audio_generator = elevenlabs_client.generate(
                text=ai_text,
                voice=voice_id,
                model="eleven_monolingual_v1"
            )
            
            # Convert generator to bytes
            audio_bytes = b"".join(audio_generator)
            print(f"Generated {len(audio_bytes)} bytes of audio")
            
            if len(audio_bytes) > 0:
                return StreamingResponse(
                    io.BytesIO(audio_bytes),
                    media_type="audio/mpeg",
                    headers={
                        "Access-Control-Allow-Origin": "*",
                        "X-Transcript": ai_text
                    }
                )
            else:
                print("No audio generated, returning text response")
                return {"message": ai_text, "status": "text_only"}
            
        except Exception as e:
            print(f"TTS error: {e}")
            import traceback
            traceback.print_exc()
            return {"message": ai_text, "status": "text_only"}

    except Exception as e:
        print(f"Error: {e}")
        return {"message": "Let's continue with the interview. What would you like to discuss?", "status": "success"}

@app.post("/api/interview/start")
async def start_interview(
    user_id: str = Form(...),
    persona: str = Form(...),
    interview_topic: str = Form(...)
):
    try:
        session_id = f"{user_id}_{int(time.time())}"
        print(f"Starting interview: {persona} for {interview_topic}")
        
        user_sessions[session_id] = {
            "user_id": user_id,
            "persona": persona,
            "topic": interview_topic,
            "started_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        conversation_history[session_id] = []
        
        # Generate opening message
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""You are {persona}, starting a {interview_topic} interview. 

Give a warm, brief welcome (under 30 words) and ask the candidate to introduce themselves."""
            
            response = model.generate_content(prompt)
            opening_message = response.text.strip()
            print(f"Opening message: {opening_message}")
        except Exception as e:
            print(f"AI error: {e}")
            opening_message = f"Hello! I'm {persona}. Welcome to your {interview_topic} interview. Please introduce yourself and tell me about your background."
        
        # Get voice for TTS
        voice_id = "21m00Tcm4TlvDq8ikWAM"  # Default ElevenLabs voice
        
        print(f"Looking for voice for persona: '{persona}'")
        print(f"Available voices: {list(voice_personas.keys())}")
        
        if persona in voice_personas:
            voice_id = voice_personas[persona]['voice_id']
            print(f"Using custom voice for {persona}: {voice_id}")
        else:
            print(f"No custom voice for '{persona}', using default")
        
        try:
            # Generate TTS
            print(f"Generating opening TTS with voice: {voice_id}")
            print(f"Opening message: '{opening_message}'")
            
            audio_generator = elevenlabs_client.generate(
                text=opening_message,
                voice=voice_id,
                model="eleven_monolingual_v1"
            )
            audio_bytes = b"".join(audio_generator)
            print(f"Generated {len(audio_bytes)} bytes of audio")
            
            if len(audio_bytes) > 0:
                return StreamingResponse(
                    io.BytesIO(audio_bytes),
                    media_type="audio/mpeg",
                    headers={
                        "Access-Control-Allow-Origin": "*",
                        "X-Session-ID": session_id,
                        "X-Message": opening_message
                    }
                )
            else:
                print("No opening audio generated, returning text response")
                return {
                    "message": opening_message, 
                    "session_id": session_id,
                    "status": "success"
                }
        except Exception as e:
            print(f"TTS error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "message": opening_message, 
                "session_id": session_id,
                "status": "success"
            }
            
    except Exception as e:
        print(f"Interview start error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def health_check():
    return {"status": "IVY Backend is running", "port": 8006}

@app.get("/api/voice/personas")
async def get_personas():
    return {
        "personas": voice_personas,
        "count": len(voice_personas)
    }

@app.get("/api/debug/voices")
async def debug_voices():
    print("=== VOICE DEBUG ===")
    for name, data in voice_personas.items():
        print(f"Persona: {name} -> Voice ID: {data['voice_id']}")
    print("==================")
    return voice_personas

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
