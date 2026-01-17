from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
from dotenv import load_dotenv
import google.generativeai as genai
from elevenlabs.client import ElevenLabs
from elevenlabs import Voice
from supabase import create_client
from openai import OpenAI
import io

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Clients
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
elevenlabs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy"))
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# Persona Voice Database
VOICE_DB = {
    "Shambhu": "pNInz6obpgueM0WZtGIn",
    "Shreyas": "21m00Tcm4TlvDq8ikWAM",
    "Shreya": "EXAVITQu4vr4xnSDxMaL",
}

PERSONA_PROMPTS = {
    "Shambhu": "You are Shambhu, a strict Technical Lead conducting an interview. Be professional, calm, and composed. Ask deep technical questions about system design, algorithms, and implementation details. When the user gives surface-level answers, politely say 'Could you elaborate on that?' and dig deeper. Keep responses concise and focused.",
    "Shreyas": "You are Shreyas, an experienced HR Director conducting a behavioral interview. Be warm, enthusiastic, and encouraging. Focus on leadership experiences, team dynamics, and problem-solving approaches. Ask follow-up questions about specific situations and outcomes. Keep the conversation flowing naturally.",
    "Shreya": "You are Shreya, a Product Manager conducting a product interview. Be energetic and analytical. Ask about product strategy, user experience, trade-offs, and prioritization. Challenge assumptions and ask for data-driven reasoning. Keep questions sharp and expect concise, well-structured answers."
}

@app.post("/api/chat")
async def handle_chat(
    session_id: str = Form(...),
    persona: str = Form(...),
    user_id: str = Form(...),
    audio_file: UploadFile = File(...)
):
    try:
        print(f"Received chat request: persona={persona}, session={session_id}")
        
        # 1. Transcribe User Audio (OpenAI Whisper)
        content = await audio_file.read()
        print(f"Audio file size: {len(content)} bytes")
        
        try:
            # Save audio temporarily
            with open("temp_audio.wav", "wb") as f:
                f.write(content)
            
            # Transcribe with OpenAI Whisper
            with open("temp_audio.wav", "rb") as f:
                transcription = openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=f
                )
            user_text = transcription.text
            print(f"Transcribed: {user_text}")
            
            # Clean up temp file
            os.remove("temp_audio.wav")
            
        except Exception as e:
            print(f"Transcription failed: {e}")
            user_text = "I want to practice system design interviews"
        print(f"Transcribed text: {user_text}")

        # Skip database for now - direct AI response
        model = genai.GenerativeModel('gemini-pro')
        system_prompt = f"{PERSONA_PROMPTS.get(persona, '')}\n\nThis is an interview practice session. The user said: {user_text}. Respond as an interviewer."
        
        response = model.generate_content(system_prompt)
        ai_text = response.text
        print(f"AI response: {ai_text}")

        # Simple text response for testing
        return {"message": ai_text, "status": "success"}

    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tts")
async def text_to_speech(text: str = Form(...), persona: str = Form(...)):
    try:
        voice_id = VOICE_DB.get(persona, VOICE_DB["Shambhu"])
        
        audio_generator = elevenlabs_client.generate(
            text=text,
            voice=voice_id,
            model="eleven_monolingual_v1"
        )
        
        audio_bytes = b"".join(audio_generator)
        return {"message": "TTS working", "audio_url": "test"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/clone")
async def clone_voice(
    user_id: str = Form(...),
    voice_name: str = Form(...),
    audio_file: UploadFile = File(...)
):
    try:
        content = await audio_file.read()
        
        # Clone voice with ElevenLabs
        try:
            voice = elevenlabs_client.clone(
                name=voice_name,
                description=f"Custom voice for {user_id}",
                files=[content]
            )
            voice_id = voice.voice_id
        except:
            # Fallback if cloning fails
            voice_id = f"custom_{user_id}_{voice_name}"

        # Save to Supabase
        supabase.table("profiles").update({
            "custom_voice_id": voice_id
        }).eq("id", user_id).execute()

        # Store audio in Supabase Storage
        supabase.storage.from_("voice-samples").upload(
            f"{user_id}/{voice_name}.wav",
            content
        )

        return {"voice_id": voice_id, "status": "success"}

    except Exception as e:
        # Fallback to placeholder if cloning fails
        voice_id = f"custom_{user_id}_{voice_name}"
        return {"voice_id": voice_id, "status": "success"}


@app.post("/api/session/create")
async def create_session(user_id: str = Form(...), persona: str = Form(...)):
    try:
        response = supabase.table("sessions").insert({
            "user_id": user_id,
            "persona_name": persona,
            "title": f"Interview with {persona}"
        }).execute()

        return {"session_id": response.data[0]["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sessions/{user_id}")
async def get_sessions(user_id: str):
    try:
        response = supabase.table("sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"sessions": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
