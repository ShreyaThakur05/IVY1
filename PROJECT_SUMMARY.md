# 📋 IVY - Project Summary

## 🎯 Project Overview

**IVY (Interview Virtual You)** is a voice-first AI interview simulation platform that enables users to practice interviews with specialized AI personas or their own cloned voice.

### Value Proposition
"Master your interviews with yourself or the experts."

### Core Innovation
- **Sub-2.5s latency** speech-to-speech pipeline
- **High-fidelity voice cloning** from 60-second samples
- **Specialized AI personas** with distinct interview styles
- **Persistent conversation history** with context awareness

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  Next.js 14 + Tailwind CSS + Framer Motion                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Auth     │  │ Sidebar  │  │ Personas │  │ VoiceLab │   │
│  │ Component│  │ History  │  │ Selector │  │ Modal    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│                    FastAPI (Python)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ STT      │→ │ LLM      │→ │ TTS      │→ │ Response │   │
│  │ Groq     │  │ Gemini   │  │ ElevenLabs│  │ Stream   │   │
│  │ Whisper  │  │ 1.5 Flash│  │ Flash v2.5│  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL/Storage
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Auth     │  │ Profiles │  │ Sessions │  │ Messages │   │
│  │ (JWT)    │  │ Table    │  │ Table    │  │ Table    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Storage: Voice Samples (S3)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Breakdown

### Frontend Components (React/Next.js)

#### 1. **Auth.jsx** (Login/Register)
- Glassmorphism design
- Email + OAuth (Google, GitHub)
- Sliding panel animation
- Supabase authentication

#### 2. **Sidebar.jsx** (Session History)
- Chronological interview list
- User profile with avatar
- New interview button
- Custom scrollbar styling

#### 3. **PersonaCard.jsx** (Persona Selector)
- 3 preset personas (Shambhu, Shreyas, Shreya)
- Dynamic color theming
- Hover animations
- Active state highlighting

#### 4. **InterviewStage.jsx** (Main Interview UI)
- Animated avatar circle
- Orbital control buttons
- Real-time status indicators
- Persona-specific theming

#### 5. **VoiceLab.jsx** (Voice Cloning)
- Live 60s recording with timer
- File upload option
- Progress visualization
- Recording script display

### Backend Endpoints (FastAPI)

#### 1. **POST /api/chat**
```python
Input: audio_file, session_id, persona, user_id
Process: STT → History Retrieval → LLM → TTS
Output: Audio stream (AI response)
```

#### 2. **POST /api/voice/clone**
```python
Input: audio_file, user_id, voice_name
Process: ElevenLabs API → voice_id generation
Output: voice_id, status
```

#### 3. **POST /api/session/create**
```python
Input: user_id, persona
Process: Create new session in DB
Output: session_id
```

#### 4. **GET /api/sessions/{user_id}**
```python
Input: user_id
Process: Fetch all user sessions
Output: sessions[]
```

---

## 🗄️ Database Schema

### Tables

#### **profiles**
```sql
id              UUID (PK, FK to auth.users)
full_name       TEXT
avatar_url      TEXT
custom_voice_id TEXT (ElevenLabs voice_id)
created_at      TIMESTAMP
```

#### **sessions**
```sql
id              UUID (PK)
user_id         UUID (FK to profiles)
title           TEXT
persona_name    TEXT
created_at      TIMESTAMP
```

#### **messages**
```sql
id              UUID (PK)
session_id      UUID (FK to sessions)
sender          TEXT ('user' | 'ai')
content         TEXT (transcript)
audio_url       TEXT (optional)
created_at      TIMESTAMP
```

### Storage Buckets

#### **voice-samples**
- Path: `{user_id}/{voice_name}.wav`
- Access: Private (RLS policies)
- Purpose: Store 60s voice recordings

---

## 🎭 Persona Configuration

### Shambhu (Technical Architect)
- **Color**: Indigo
- **Voice ID**: `pNInz6obpgueM0WZtGIn`
- **Style**: Rigorous, logic-focused
- **Prompt**: "Strict Technical Lead. Use industry jargon. Ask for implementation details."

### Shreyas (HR Director)
- **Color**: Emerald
- **Voice ID**: `21m00Tcm4TlvDq8ikWAM`
- **Style**: Behavioral, soft-skills
- **Prompt**: "HR Director. Focus on 'Why' and 'How'. Look for leadership traits."

### Shreya (Product Manager)
- **Color**: Rose
- **Voice ID**: `EXAVITQu4vr4xnSDxMaL`
- **Style**: User-centric, strategic
- **Prompt**: "Product Manager. Questions about trade-offs, user impact, prioritization."

---

## 🔄 Data Flow

### Interview Session Flow

```
1. User clicks "Go Live"
   ↓
2. MediaRecorder starts capturing audio
   ↓
3. Silence detection triggers upload
   ↓
4. Frontend → POST /api/chat (audio blob)
   ↓
5. Backend: Groq Whisper transcribes (200ms)
   ↓
6. Backend: Fetch last 10 messages from DB
   ↓
7. Backend: Gemini generates response (800ms)
   ↓
8. Backend: ElevenLabs synthesizes voice (1000ms)
   ↓
9. Backend: Save user + AI messages to DB
   ↓
10. Backend → Frontend: Stream audio response
    ↓
11. Frontend: Play audio + update UI
```

### Voice Cloning Flow

```
1. User clicks "Clone Me" → Records 60s
   ↓
2. Frontend → POST /api/voice/clone (audio blob)
   ↓
3. Backend: ElevenLabs API creates voice
   ↓
4. Backend: Save voice_id to profiles table
   ↓
5. Backend: Upload audio to Supabase Storage
   ↓
6. Backend → Frontend: Return voice_id
   ↓
7. Frontend: Show success message
```

---

## 🎨 Design System

### Colors
- **Background**: `#0a0a0c` (near black)
- **Surface**: `#0f0f12` (dark gray)
- **Primary**: Indigo 600
- **Accent**: Emerald 600, Rose 600
- **Text**: Slate 200

### Typography
- **Font**: System fonts (sans-serif)
- **Headings**: Black weight (900)
- **Body**: Medium weight (500)

### Effects
- **Glassmorphism**: `backdrop-blur(20px)` + `rgba(15,15,18,0.7)`
- **Shadows**: Colored glows matching persona
- **Animations**: Framer Motion + Tailwind transitions

---

## 📊 Performance Metrics

### Target Latency
- **STT (Groq)**: 200ms
- **LLM (Gemini)**: 800ms
- **TTS (ElevenLabs)**: 1000ms
- **Network**: 200ms
- **Total**: ~2.2s ✅

### Optimization Strategies
1. **Streaming TTS**: Start playback before full generation
2. **Audio Chunking**: Send audio in 3s chunks
3. **Context Pruning**: Only send last 10 messages
4. **Parallel Processing**: STT + History fetch simultaneously

---

## 🔐 Security Features

### Authentication
- Supabase Auth (JWT tokens)
- OAuth providers (Google, GitHub)
- Email verification

### Authorization
- Row Level Security (RLS) policies
- User can only access own data
- Voice samples are private

### API Security
- CORS restrictions
- Rate limiting (TODO)
- API key rotation (TODO)

---

## 🚀 Deployment Architecture

### Production Stack
```
Frontend: Vercel (Edge Network)
Backend: Railway/Render (Containerized)
Database: Supabase (Managed PostgreSQL)
Storage: Supabase Storage (S3-compatible)
CDN: Vercel Edge Network
```

### Scaling Strategy
- **Horizontal**: Multiple backend instances
- **Vertical**: Upgrade database tier
- **Caching**: Redis for session data
- **Queue**: RabbitMQ for async tasks

---

## 📈 Future Enhancements

### Phase 2 (Weeks 2-4)
- [ ] Transcript view with timestamps
- [ ] Session analytics dashboard
- [ ] Custom persona creation
- [ ] Interview feedback scoring

### Phase 3 (Months 2-3)
- [ ] Video avatar integration
- [ ] Multi-language support
- [ ] Team collaboration features
- [ ] Mobile app (React Native)

### Phase 4 (Months 4-6)
- [ ] AI-powered feedback
- [ ] Interview marketplace
- [ ] Enterprise features
- [ ] White-label solution

---

## 📝 Development Guidelines

### Code Style
- **Frontend**: ESLint + Prettier
- **Backend**: Black + Flake8
- **Commits**: Conventional Commits

### Testing
- **Unit**: Jest (Frontend), Pytest (Backend)
- **Integration**: Playwright
- **E2E**: Cypress

### Documentation
- **API**: OpenAPI/Swagger (auto-generated)
- **Components**: Storybook
- **Database**: dbdocs.io

---

## 🎓 Learning Resources

### Technologies Used
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Supabase Guide](https://supabase.com/docs)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [Groq Documentation](https://console.groq.com/docs)
- [Gemini API](https://ai.google.dev/docs)

---

**Built with ❤️ for interview excellence**
