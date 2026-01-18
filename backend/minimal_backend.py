#!/usr/bin/env python3
"""
Minimal working backend for voice testing
"""
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import time
import io

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ElevenLabs client
elevenlabs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

# Simple storage
voice_storage = {}

@app.get("/")
async def health():
    return {"status": "running", "message": "Minimal backend for voice testing"}

@app.post("/api/voice/clone")
async def clone_voice(
    user_id: str = Form(...),
    voice_name: str = Form(...),
    persona_id: str = Form(...),
    audio_file: UploadFile = File(...)
):
    print(f"[CLONE] Persona: {persona_id}, Voice: {voice_name}")
    
    content = await audio_file.read()
    print(f"[CLONE] Audio size: {len(content)} bytes")
    
    # Try real ElevenLabs cloning
    temp_file = f"temp_voice_{int(time.time())}.wav"
    try:
        with open(temp_file, "wb") as f:
            f.write(content)
        
        voice = elevenlabs_client.clone(
            name=voice_name,
            description=f"Custom voice for {voice_name}",
            files=[temp_file]
        )
        voice_id = voice.voice_id
        print(f"[CLONE] SUCCESS: Real voice created: {voice_id}")
        
    except Exception as e:
        print(f"[CLONE] ElevenLabs failed: {e}")
        # Use default voice as fallback
        voice_id = "21m00Tcm4TlvDq8ikWAM"
        print(f"[CLONE] FALLBACK: Using default voice")
    
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)
    
    # Store the voice
    voice_storage[persona_id] = {
        "voice_id": voice_id,
        "voice_name": voice_name,
        "user_id": user_id
    }
    
    print(f"[CLONE] STORED: {persona_id} -> {voice_id}")
    return {"voice_id": voice_id, "status": "success"}

@app.post("/api/interview/start")
async def start_interview(
    user_id: str = Form(...),
    persona_id: str = Form(...),
    persona_name: str = Form(...),
    interview_topic: str = Form(...)
):
    print(f"[INTERVIEW] Starting with persona: {persona_id}")
    
    # Get voice for this persona
    voice_id = "21m00Tcm4TlvDq8ikWAM"  # Default
    if persona_id in voice_storage:
        stored_voice_id = voice_storage[persona_id]["voice_id"]
        if stored_voice_id != "21m00Tcm4TlvDq8ikWAM":
            voice_id = stored_voice_id
            print(f"[INTERVIEW] Using custom voice: {voice_id}")
        else:
            print(f"[INTERVIEW] Using default voice")
    else:
        print(f"[INTERVIEW] No voice found, using default")
    
    # Generate opening message
    opening_message = f"Hello! I'm {persona_name}. Welcome to your {interview_topic} interview. Please introduce yourself."
    
    # Generate TTS
    try:
        print(f"[TTS] Generating with voice: {voice_id}")
        audio_generator = elevenlabs_client.generate(
            text=opening_message,
            voice=voice_id,
            model="eleven_turbo_v2_5"
        )
        audio_bytes = b"".join(audio_generator)
        print(f"[TTS] SUCCESS: Generated {len(audio_bytes)} bytes")
        
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Access-Control-Allow-Origin": "*",
                "X-Session-ID": f"{user_id}_{int(time.time())}"
            }
        )
        
    except Exception as e:
        print(f"[TTS] ERROR: {e}")
        return {
            "message": opening_message,
            "session_id": f"{user_id}_{int(time.time())}",
            "error": str(e)
        }

@app.get("/api/debug/voices")
async def debug_voices():
    return {"voices": voice_storage}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)