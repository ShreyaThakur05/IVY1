# 🏗️ IVY Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    NEXT.JS FRONTEND                             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │ │
│  │  │  Auth    │  │ Sidebar  │  │ Personas │  │ VoiceLab │      │ │
│  │  │Component │  │ History  │  │ Selector │  │  Modal   │      │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │ │
│  │       │             │             │             │              │ │
│  │       └─────────────┴─────────────┴─────────────┘              │ │
│  │                          │                                      │ │
│  │                    ┌─────▼─────┐                               │ │
│  │                    │ API Layer │                               │ │
│  │                    │ (api.js)  │                               │ │
│  │                    └─────┬─────┘                               │ │
│  └──────────────────────────┼──────────────────────────────────────┘ │
└────────────────────────────┼───────────────────────────────────────┘
                             │
                    HTTP/WebSocket
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                      FASTAPI BACKEND                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    API ENDPOINTS                              │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │ /chat    │  │ /voice/  │  │ /session/│  │ /sessions│    │  │
│  │  │          │  │  clone   │  │  create  │  │  /{id}   │    │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │  │
│  └───────┼─────────────┼─────────────┼─────────────┼───────────┘  │
│          │             │             │             │               │
│  ┌───────▼─────────────▼─────────────▼─────────────▼───────────┐  │
│  │                  AI ORCHESTRATION                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │  │
│  │  │   STT    │→ │   LLM    │→ │   TTS    │                  │  │
│  │  │  Groq    │  │  Gemini  │  │ElevenLabs│                  │  │
│  │  │ Whisper  │  │  Flash   │  │ Flash v2 │                  │  │
│  │  │ (~200ms) │  │ (~800ms) │  │ (~1000ms)│                  │  │
│  │  └──────────┘  └──────────┘  └──────────┘                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                        SQL/Storage
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                         SUPABASE                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    AUTHENTICATION                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │  │
│  │  │  Email   │  │  Google  │  │  GitHub  │                   │  │
│  │  │   Auth   │  │  OAuth   │  │  OAuth   │                   │  │
│  │  └──────────┘  └──────────┘  └──────────┘                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    POSTGRESQL DATABASE                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │  │
│  │  │ profiles │  │ sessions │  │ messages │                   │  │
│  │  │  table   │  │  table   │  │  table   │                   │  │
│  │  └──────────┘  └──────────┘  └──────────┘                   │  │
│  │       │             │             │                           │  │
│  │       └─────────────┴─────────────┘                           │  │
│  │                     │                                         │  │
│  │              Row Level Security                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    STORAGE (S3)                               │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │         voice-samples bucket                         │    │  │
│  │  │  {user_id}/voice_name.wav                           │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Interview Session

```
┌─────────┐
│  USER   │
│ Speaks  │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ MediaRecorder   │  Records audio
│ (Browser API)   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Silence         │  Detects end of speech
│ Detection       │
└────┬────────────┘
     │
     ▼ Audio Blob
┌─────────────────┐
│ POST /api/chat  │  FormData with audio
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Groq Whisper    │  Speech-to-Text
│ STT (~200ms)    │
└────┬────────────┘
     │
     ▼ Transcript
┌─────────────────┐
│ Fetch History   │  Last 10 messages
│ from Supabase   │
└────┬────────────┘
     │
     ▼ Context
┌─────────────────┐
│ Gemini 1.5      │  Generate response
│ Flash (~800ms)  │  with persona prompt
└────┬────────────┘
     │
     ▼ AI Text
┌─────────────────┐
│ ElevenLabs      │  Text-to-Speech
│ TTS (~1000ms)   │  with persona voice
└────┬────────────┘
     │
     ▼ Audio Stream
┌─────────────────┐
│ Save Messages   │  User + AI to DB
│ to Database     │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Stream Audio    │  Return to frontend
│ Response        │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Audio Playback  │  Browser plays audio
│ (Browser)       │
└─────────────────┘
```

**Total Latency: ~2.2 seconds** ✅

---

## Data Flow: Voice Cloning

```
┌─────────┐
│  USER   │
│ Records │
│  60s    │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ MediaRecorder   │  Captures audio
│ with Timer      │
└────┬────────────┘
     │
     ▼ Audio Blob
┌─────────────────┐
│ POST /api/voice/│  FormData with audio
│ clone           │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ ElevenLabs      │  Create voice model
│ Voice Cloning   │
└────┬────────────┘
     │
     ▼ voice_id
┌─────────────────┐
│ Save to         │  Update profiles table
│ profiles.       │  custom_voice_id
│ custom_voice_id │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Upload to       │  Store in voice-samples
│ Supabase        │  bucket for backup
│ Storage         │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Return Success  │  voice_id to frontend
└─────────────────┘
```

---

## Component Hierarchy

```
App (page.jsx)
│
├── Auth (Auth.jsx)
│   ├── Sign In Form
│   ├── Sign Up Form
│   └── Toggle Panel
│
└── Main Layout
    │
    ├── Sidebar (Sidebar.jsx)
    │   ├── Logo
    │   ├── New Interview Button
    │   ├── Session List
    │   │   └── SidebarItem (inline)
    │   └── User Profile
    │
    └── Main Content
        │
        ├── Header
        │   ├── Session ID
        │   ├── Voice Lab Button
        │   └── Go Live Button
        │
        ├── Content Area
        │   ├── Persona Grid
        │   │   └── PersonaCard (PersonaCard.jsx) × 3
        │   │
        │   └── InterviewStage (InterviewStage.jsx)
        │       ├── Avatar Circle
        │       ├── Status Text
        │       └── Control Buttons
        │
        └── VoiceLab Modal (VoiceLab.jsx)
            ├── Clone Me Panel
            │   ├── Record Button
            │   ├── Timer
            │   └── Progress Bar
            │
            ├── Add Voice Panel
            │   └── File Upload
            │
            └── Recording Script
```

---

## Database Relationships

```
┌─────────────────┐
│   auth.users    │  (Supabase Auth)
│   ─────────     │
│   id (PK)       │
│   email         │
│   password_hash │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│    profiles     │
│   ─────────     │
│   id (PK, FK)   │◄──────────┐
│   full_name     │           │
│   avatar_url    │           │
│   custom_voice  │           │
└────────┬────────┘           │
         │                    │
         │ 1:N                │
         │                    │
┌────────▼────────┐           │
│    sessions     │           │
│   ─────────     │           │
│   id (PK)       │           │
│   user_id (FK)  │───────────┘
│   title         │
│   persona_name  │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│    messages     │
│   ─────────     │
│   id (PK)       │
│   session_id(FK)│
│   sender        │
│   content       │
│   audio_url     │
└─────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Environment Variables (.env.local)                │ │
│  │  - NEXT_PUBLIC_SUPABASE_URL                        │ │
│  │  - NEXT_PUBLIC_SUPABASE_ANON_KEY                   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                    JWT Token
                         │
┌─────────────────────────▼───────────────────────────────┐
│                    SUPABASE                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Row Level Security (RLS)                          │ │
│  │  - Users can only see own data                     │ │
│  │  - Policies on all tables                          │ │
│  │  - Storage bucket policies                         │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                    Service Key
                         │
┌─────────────────────────▼───────────────────────────────┐
│                    BACKEND                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Environment Variables (backend/.env)              │ │
│  │  - GROQ_API_KEY                                    │ │
│  │  - GEMINI_API_KEY                                  │ │
│  │  - ELEVENLABS_API_KEY                              │ │
│  │  - SUPABASE_KEY (service_role)                     │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  CORS Restrictions                                 │ │
│  │  - Only allow localhost:3000                       │ │
│  │  - Production domain whitelist                     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Edge Network (CDN)                                │ │
│  │  - Static assets cached globally                   │ │
│  │  - Automatic HTTPS                                 │ │
│  │  - DDoS protection                                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                    HTTPS/WSS
                         │
┌─────────────────────────▼───────────────────────────────┐
│                 RAILWAY/RENDER (Backend)                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Container (Docker)                                │ │
│  │  - FastAPI application                             │ │
│  │  - Auto-scaling                                    │ │
│  │  - Health checks                                   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                    PostgreSQL
                         │
┌─────────────────────────▼───────────────────────────────┐
│                    SUPABASE (Database)                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Managed PostgreSQL                                │ │
│  │  - Automatic backups                               │ │
│  │  - Connection pooling                              │ │
│  │  - Read replicas (Pro)                             │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  S3-compatible Storage                             │ │
│  │  - Voice samples                                   │ │
│  │  - CDN delivery                                    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

**🎯 Clean, Modular, Production-Ready Architecture**
