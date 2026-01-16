from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
from dotenv import load_dotenv
from groq import Groq
import google.generativeai as genai
from elevenlabs.client import ElevenLabs
from supabase import create_client
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
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
elevenlabs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# Persona Voice Database
VOICE_DB = {
    "Shambhu": "pNInz6obpgueM0WZtGIn",
    "Shreyas": "21m00Tcm4TlvDq8ikWAM",
    "Shreya": "EXAVITQu4vr4xnSDxMaL",
}

PERSONA_PROMPTS = {
    "Shambhu": "You are Shambhu, a strict Technical Lead. Use industry jargon. If the user gives a surface-level answer, say 'Dig deeper' and ask for implementation details.",
    "Shreyas": "You are Shreyas, an HR Director. Focus on 'Why' and 'How'. Look for leadership traits and emotional intelligence in the answers.",
    "Shreya": "You are Shreya, a Product Manager. Your questions are about trade-offs, user impact, and prioritization. You are quick and expect concise answers."
}

@app.post("/api/chat")
async def handle_chat(
    session_id: str = Form(...),
    persona: str = Form(...),
    user_id: str = Form(...),
    audio_file: UploadFile = File(...)
):
    try:
        # 1. Transcribe User Audio (Groq Whisper)
        content = await audio_file.read()
        transcription = groq_client.audio.transcriptions.create(
            file=("audio.wav", content),
            model="whisper-large-v3-turbo",
        )
        user_text = transcription.text

        # 2. Retrieve History from Database
        history_response = supabase.table("messages").select("*").eq("session_id", session_id).order("created_at").execute()
        history = []
        for msg in history_response.data[-10:]:  # Last 10 messages
            role = "user" if msg["sender"] == "user" else "model"
            history.append({"role": role, "parts": [msg["content"]]})

        # 3. Get AI Response (Gemini)
        model = genai.GenerativeModel('gemini-1.5-flash')
        chat = model.start_chat(history=history)
        
        system_prompt = PERSONA_PROMPTS.get(persona, "")
        prompt = f"{system_prompt}\n\nUser: {user_text}"
        response = chat.send_message(prompt)
        ai_text = response.text

        # 4. Synthesize Voice (ElevenLabs)
        voice_id = VOICE_DB.get(persona, VOICE_DB["Shambhu"])
        
        audio_generator = elevenlabs_client.generate(
            text=ai_text,
            voice=voice_id,
            model="eleven_monolingual_v1"
        )
        
        audio_bytes = b"".join(audio_generator)

        # 5. Save to DB
        supabase.table("messages").insert({
            "session_id": session_id,
            "sender": "user",
            "content": user_text
        }).execute()

        supabase.table("messages").insert({
            "session_id": session_id,
            "sender": "ai",
            "content": ai_text
        }).execute()

        # 6. Stream audio response
        return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg")

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
        
        # Voice cloning placeholder (requires ElevenLabs Pro)
        voice_id = "placeholder_voice_id"

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
        raise HTTPException(status_code=500, detail=str(e))


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
    uvicorn.run(app, host="0.0.0.0", port=8000)
