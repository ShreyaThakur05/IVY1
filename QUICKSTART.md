# 🚀 Quick Start Guide - IVY

## Step 1: Install Dependencies (2 minutes)

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

## Step 2: Get API Keys (5 minutes)

### Groq (Free)
1. Visit: https://console.groq.com
2. Sign up → API Keys → Create
3. Copy key

### Google Gemini (Free)
1. Visit: https://makersuite.google.com/app/apikey
2. Create API Key
3. Copy key

### ElevenLabs (Free tier available)
1. Visit: https://elevenlabs.io
2. Sign up → Profile → API Key
3. Copy key

### Supabase (Free)
1. Visit: https://supabase.com
2. New Project → Copy URL & anon key
3. Settings → API → Copy service_role key

## Step 3: Configure Environment (2 minutes)

Create `.env.local` in root:
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

## Step 4: Setup Database (3 minutes)

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire content from `supabase_schema.sql`
4. Paste and Run
5. Go to Authentication → Providers
6. Enable: Email, Google (optional), GitHub (optional)

## Step 5: Run Application (1 minute)

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
cd backend
python main.py
```

## Step 6: Test It! 🎉

1. Open: http://localhost:3000
2. Sign up with email
3. Click "Voice Lab" → Record 60s
4. Select a persona (Shambhu/Shreyas/Shreya)
5. Click "Go Live" → Start speaking!

## 🐛 Troubleshooting

### "Module not found" error
```bash
npm install
# or
pip install -r requirements.txt
```

### CORS error
- Check backend is running on port 8000
- Check frontend is on port 3000

### Supabase connection error
- Verify .env.local has correct URL and keys
- Check Supabase project is active

### Microphone not working
- Allow browser microphone permissions
- Use HTTPS or localhost only

## 📊 Expected Performance

- **STT (Groq)**: ~200ms
- **LLM (Gemini)**: ~800ms
- **TTS (ElevenLabs)**: ~1000ms
- **Total Latency**: ~2s ✅

## 🎯 What's Next?

1. Customize persona prompts in `src/lib/personas.js`
2. Add more personas
3. Implement transcript view
4. Add session analytics
5. Deploy to production!

---

**Need help?** Check README.md for detailed documentation.
