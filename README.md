# IVY - Interview Virtual You

**"Master your interviews with yourself or the experts."**

A low-latency, voice-first interview simulation platform using AI voice cloning and specialized interviewer personas.

## 🎯 Features

- **3 AI Personas**: Shambhu (Technical), Shreyas (HR), Shreya (Product)
- **Voice Cloning**: 60-second live recording or file upload
- **Real-time Conversations**: Speech-to-Speech with <2.5s latency
- **Persistent History**: Gemini-style sidebar with session management
- **Glassmorphism UI**: Modern, sleek design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Supabase** - Auth & Database

### Backend
- **FastAPI** - Python backend
- **Groq (Whisper)** - Speech-to-Text
- **Gemini 1.5 Flash** - LLM
- **ElevenLabs** - Text-to-Speech & Voice Cloning
- **Supabase** - PostgreSQL database

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account
- API keys: Groq, Gemini, ElevenLabs

### 1. Clone & Install Frontend

```bash
cd ivy
npm install
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Environment Variables

Create `.env.local` in root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
```

### 4. Setup Supabase Database

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `supabase_schema.sql`
3. Enable Authentication providers (Email, Google, GitHub)

### 5. Run the Application

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
python main.py
```

Visit: `http://localhost:3000`

## 📁 Project Structure

```
ivy/
├── src/
│   ├── app/
│   │   ├── layout.jsx          # Root layout
│   │   └── page.jsx            # Main page
│   ├── components/
│   │   ├── Auth.jsx            # Login/Register
│   │   ├── Sidebar.jsx         # Session history
│   │   ├── PersonaCard.jsx     # Persona selector
│   │   ├── InterviewStage.jsx  # Main interview UI
│   │   └── VoiceLab.jsx        # Voice cloning modal
│   ├── lib/
│   │   ├── supabase.js         # Supabase client
│   │   └── personas.js         # Persona config
│   └── styles/
│       └── globals.css         # Global styles
├── backend/
│   ├── main.py                 # FastAPI server
│   └── requirements.txt        # Python dependencies
├── supabase_schema.sql         # Database schema
└── package.json
```

## 🎨 Key Components

### Personas Configuration
Located in `src/lib/personas.js`:
- Shambhu: Technical deep-dives
- Shreyas: Behavioral & soft skills
- Shreya: Product strategy

### Voice Cloning Flow
1. User records 60s audio or uploads file
2. Frontend sends to `/api/voice/clone`
3. Backend calls ElevenLabs API
4. `voice_id` saved to user profile

### Interview Flow
1. User selects persona
2. Clicks "Start Speaking"
3. Audio recorded → sent to `/api/chat`
4. Backend: STT → LLM → TTS
5. AI response streamed back

## 🔐 Database Schema

### Tables
- **profiles**: User data + custom_voice_id
- **sessions**: Interview sessions
- **messages**: Conversation history

### Storage
- **voice-samples**: User voice recordings

## 🚀 7-Day Implementation Plan

- **Day 1**: Setup & Layout ✅
- **Day 2**: Audio Foundation
- **Day 3**: Persona Intelligence
- **Day 4**: ElevenLabs Integration
- **Day 5**: Voice Cloning
- **Day 6**: History & Persistence
- **Day 7**: Polish & Optimization

## 📝 API Endpoints

### Backend (FastAPI)

```
POST /api/chat
- Params: session_id, persona, user_id, audio_file
- Returns: Audio stream (AI response)

POST /api/voice/clone
- Params: user_id, voice_name, audio_file
- Returns: voice_id

POST /api/session/create
- Params: user_id, persona
- Returns: session_id

GET /api/sessions/{user_id}
- Returns: List of user sessions
```

## 🎯 Next Steps

1. **Install dependencies**: `npm install`
2. **Get API keys**: Groq, Gemini, ElevenLabs
3. **Setup Supabase**: Run schema SQL
4. **Configure .env files**
5. **Run dev servers**
6. **Test voice cloning**
7. **Start interviewing!**

## 📄 License

MIT License - Build amazing things!

---

**Built with ❤️ for interview preparation**
