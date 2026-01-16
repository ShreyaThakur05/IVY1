# 🚀 START HERE - IVY Setup Guide

## 📋 What is IVY?

**IVY (Interview Virtual You)** is an AI-powered interview practice platform where you can:
- 🎤 Clone your voice in 60 seconds
- 🤖 Practice with 3 specialized AI interviewers
- 💬 Have real-time voice conversations
- 📊 Track your interview history
- ⚡ Get responses in under 2.5 seconds

---

## ⚡ Quick Setup (15 Minutes)

### 1️⃣ Install Dependencies (2 min)

```bash
# Frontend
npm install

# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2️⃣ Get API Keys (5 min)

| Service | URL | What to Copy |
|---------|-----|--------------|
| **Groq** | https://console.groq.com | API Key |
| **Gemini** | https://makersuite.google.com/app/apikey | API Key |
| **ElevenLabs** | https://elevenlabs.io | API Key |
| **Supabase** | https://supabase.com | URL + anon key + service key |

### 3️⃣ Configure Environment (2 min)

Create `.env.local` in root folder:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

Create `backend/.env`:
```env
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
ELEVENLABS_API_KEY=...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc... (service_role key)
```

### 4️⃣ Setup Database (3 min)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy content from `supabase_schema.sql`
4. Paste and click **Run**
5. Go to **Authentication** → **Providers** → Enable Email

### 5️⃣ Run the App (1 min)

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
venv\Scripts\activate
python main.py
```

### 6️⃣ Open & Test! 🎉

Visit: **http://localhost:3000**

---

## 📚 Documentation Guide

### 🎯 For Beginners
1. **[GET_STARTED.md](./GET_STARTED.md)** ← Read this first!
2. **[QUICKSTART.md](./QUICKSTART.md)** ← Detailed setup
3. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** ← If stuck

### 🔧 For Developers
4. **[README.md](./README.md)** ← Full documentation
5. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** ← Architecture
6. **[ARCHITECTURE.md](./ARCHITECTURE.md)** ← Visual diagrams
7. **[FEATURES.md](./FEATURES.md)** ← Feature checklist

### 🚀 For Deployment
8. **[DEPLOYMENT.md](./DEPLOYMENT.md)** ← Production guide
9. **[PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md)** ← Final summary

---

## 🎨 Project Structure

```
ivy/
│
├── 📱 FRONTEND (Next.js)
│   ├── src/app/page.jsx           # Main application
│   ├── src/components/            # UI components
│   │   ├── Auth.jsx               # Login/Register
│   │   ├── Sidebar.jsx            # History sidebar
│   │   ├── PersonaCard.jsx        # Persona cards
│   │   ├── InterviewStage.jsx     # Interview UI
│   │   └── VoiceLab.jsx           # Voice cloning
│   └── src/lib/                   # Utilities
│
├── 🔧 BACKEND (FastAPI)
│   ├── main.py                    # API server
│   └── requirements.txt           # Dependencies
│
├── 📚 DOCUMENTATION (9 guides)
│   ├── GET_STARTED.md             # Welcome guide
│   ├── QUICKSTART.md              # 15-min setup
│   ├── README.md                  # Main docs
│   ├── PROJECT_SUMMARY.md         # Architecture
│   ├── ARCHITECTURE.md            # Diagrams
│   ├── FEATURES.md                # Feature list
│   ├── DEPLOYMENT.md              # Production
│   ├── TROUBLESHOOTING.md         # Debug help
│   └── PROJECT_COMPLETE.md        # Summary
│
└── ⚙️ CONFIGURATION
    ├── package.json               # Node deps
    ├── .env.example               # Env template
    └── supabase_schema.sql        # Database
```

---

## 🎯 What Can You Do?

### ✅ Immediately (After Setup)
- Sign up / Login
- Select AI persona (Shambhu, Shreyas, Shreya)
- Clone your voice (60s recording)
- Start voice interview
- View conversation history

### 🔮 Customize (1-2 hours)
- Add your own personas
- Change UI colors/theme
- Modify system prompts
- Add new features

### 🚀 Deploy (30 minutes)
- Deploy to Vercel (frontend)
- Deploy to Railway (backend)
- Go live!

---

## 🎭 Meet the Personas

### 🔵 Shambhu - Technical Architect
- **Style**: Rigorous, logic-focused
- **Questions**: System design, algorithms, implementation
- **Best for**: Technical interviews

### 🟢 Shreyas - HR Director
- **Style**: Behavioral, empathetic
- **Questions**: Leadership, teamwork, culture fit
- **Best for**: Behavioral interviews

### 🔴 Shreya - Product Manager
- **Style**: Strategic, user-focused
- **Questions**: Trade-offs, prioritization, impact
- **Best for**: Product interviews

---

## 🔥 Key Features

### 🎤 Voice Cloning
- Record 60 seconds
- Instant AI voice model
- Practice with yourself!

### ⚡ Real-time AI
- Speech-to-text (200ms)
- AI response (800ms)
- Text-to-speech (1000ms)
- **Total: ~2 seconds!**

### 💾 Persistent History
- All conversations saved
- Resume anytime
- Track progress

### 🎨 Beautiful UI
- Glassmorphism design
- Dark theme
- Smooth animations
- Mobile-responsive

---

## 🐛 Common Issues

### "npm install" fails
```bash
npm cache clean --force
npm install
```

### "Module not found" (Python)
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### "CORS error"
- Check backend runs on port 8000
- Check frontend runs on port 3000

### "Microphone not working"
- Allow browser permissions
- Use Chrome/Edge
- Must be localhost or HTTPS

**More help**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 💡 Pro Tips

### Development
- Use Chrome DevTools (F12)
- Check Console for errors
- Monitor Network tab
- Read backend logs

### Performance
- Use Groq (fastest STT)
- Use Gemini Flash (fastest LLM)
- Use ElevenLabs Flash (fastest TTS)

### Customization
- Edit `src/lib/personas.js` for personas
- Edit `src/styles/globals.css` for theme
- Edit `backend/main.py` for API logic

---

## 📊 Tech Stack

### Frontend
- Next.js 14
- Tailwind CSS
- Framer Motion
- Supabase Auth

### Backend
- FastAPI
- Groq (Whisper)
- Gemini 1.5 Flash
- ElevenLabs

### Database
- Supabase (PostgreSQL)
- Row Level Security
- S3 Storage

---

## 🎓 Learning Path

### Day 1: Setup
- [ ] Install dependencies
- [ ] Get API keys
- [ ] Run locally
- [ ] Test features

### Day 2-3: Customize
- [ ] Read documentation
- [ ] Modify personas
- [ ] Change UI theme
- [ ] Add features

### Day 4-7: Deploy
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Configure production
- [ ] Go live!

---

## 🚀 Ready to Start?

### Step 1: Read Documentation
Start with **[GET_STARTED.md](./GET_STARTED.md)**

### Step 2: Follow Setup
Use **[QUICKSTART.md](./QUICKSTART.md)**

### Step 3: Run Locally
```bash
npm run dev
```

### Step 4: Open Browser
**http://localhost:3000**

---

## 🎉 You're Ready!

Everything is set up and documented. Just follow the steps above and you'll be running IVY in 15 minutes!

**Questions?** Check the documentation files listed above.

**Stuck?** Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Ready to deploy?** Read [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📞 Quick Links

| What | Where |
|------|-------|
| **Setup Guide** | [QUICKSTART.md](./QUICKSTART.md) |
| **Full Docs** | [README.md](./README.md) |
| **Architecture** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Features** | [FEATURES.md](./FEATURES.md) |
| **Deploy** | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| **Debug** | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |

---

**🎊 Let's build something amazing!**

```bash
npm run dev
```

**Master your interviews with IVY!** 🚀
