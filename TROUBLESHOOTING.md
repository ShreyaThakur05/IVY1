# 🔧 Troubleshooting Guide - IVY

## Common Issues & Solutions

### 🚫 Installation Issues

#### "npm install" fails
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Python dependencies fail
```bash
# Upgrade pip first
python -m pip install --upgrade pip
pip install -r requirements.txt

# If specific package fails (e.g., grpcio)
pip install --upgrade --force-reinstall grpcio
```

#### "Module not found" in Next.js
```bash
# Ensure you're in the right directory
cd ivy
npm install

# Check if src/app/page.jsx exists
ls src/app/
```

---

### 🔐 Authentication Issues

#### "Invalid API credentials" (Supabase)
1. Check `.env.local` has correct keys
2. Verify keys match Supabase dashboard
3. Restart dev server after changing .env

```bash
# Correct format:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

#### OAuth login not working
1. Supabase Dashboard → Authentication → Providers
2. Enable Google/GitHub
3. Add redirect URL: `http://localhost:3000/auth/callback`
4. Configure OAuth app in Google/GitHub console

#### "User not found" after signup
- Check if `handle_new_user()` trigger is created
- Run `supabase_schema.sql` again
- Verify in Supabase → Database → profiles table

---

### 🎤 Audio/Voice Issues

#### Microphone not detected
```javascript
// Test microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('Mic works!'))
  .catch(err => console.error('Mic error:', err))
```

**Solutions:**
- Allow microphone permission in browser
- Use HTTPS or localhost (required for getUserMedia)
- Check browser compatibility (Chrome/Edge recommended)
- Try different browser

#### Recording stops immediately
- Check if 60s timer is working
- Verify MediaRecorder is supported
- Console log to debug:
```javascript
console.log('Recording state:', mediaRecorderRef.current?.state)
```

#### No audio playback
- Check browser audio permissions
- Verify audio element exists
- Test with: `new Audio('test.mp3').play()`

---

### 🔌 Backend Connection Issues

#### "Failed to fetch" / CORS error
```python
# In backend/main.py, verify CORS settings:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Must match frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Check:**
- Backend running on port 8000
- Frontend running on port 3000
- No firewall blocking ports

#### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed (Windows)
taskkill /PID <PID> /F

# Restart backend
cd backend
python main.py
```

#### "Module 'groq' not found"
```bash
# Activate virtual environment first
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Then install
pip install -r requirements.txt
```

---

### 🤖 AI API Issues

#### Groq API errors
```python
# Test Groq connection
from groq import Groq
client = Groq(api_key="your_key")
print(client.models.list())  # Should list available models
```

**Common issues:**
- Invalid API key → Regenerate in Groq console
- Rate limit exceeded → Wait or upgrade plan
- Model not available → Use "whisper-large-v3-turbo"

#### Gemini API errors
```python
# Test Gemini
import google.generativeai as genai
genai.configure(api_key="your_key")
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content("Hello")
print(response.text)
```

**Common issues:**
- API key restrictions → Check API key settings
- Quota exceeded → Check usage in Google Cloud Console
- Region restrictions → Use VPN if needed

#### ElevenLabs API errors
```python
# Test ElevenLabs
from elevenlabs.client import ElevenLabs
client = ElevenLabs(api_key="your_key")
voices = client.voices.get_all()
print(voices)
```

**Common issues:**
- Character limit exceeded → Check usage dashboard
- Voice ID not found → Verify voice IDs in dashboard
- Cloning failed → Ensure audio is 60s+ and clear quality

---

### 💾 Database Issues

#### "relation does not exist" error
- SQL schema not run → Execute `supabase_schema.sql`
- Wrong database → Check Supabase project URL
- RLS blocking query → Disable RLS temporarily for testing

#### Can't insert into tables
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Temporarily disable RLS for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

#### Sessions not showing in sidebar
```javascript
// Debug in browser console
import { supabase } from '@/lib/supabase'
const { data, error } = await supabase.from('sessions').select('*')
console.log(data, error)
```

---

### 🎨 UI/Styling Issues

#### Tailwind classes not working
```bash
# Rebuild Tailwind
npm run dev

# Check tailwind.config.js content paths
content: ['./src/**/*.{js,ts,jsx,tsx,mdx}']
```

#### Glassmorphism not visible
- Check if `backdrop-filter` is supported
- Verify `.glass` class in globals.css
- Try different browser (Chrome/Edge best)

#### Icons not showing (Lucide)
```bash
# Reinstall lucide-react
npm install lucide-react@latest
```

---

### 🚀 Performance Issues

#### High latency (>5s)
**Diagnose:**
```javascript
console.time('STT')
// ... STT call
console.timeEnd('STT')

console.time('LLM')
// ... LLM call
console.timeEnd('LLM')

console.time('TTS')
// ... TTS call
console.timeEnd('TTS')
```

**Solutions:**
- Use Groq (fastest STT)
- Use Gemini Flash (fastest LLM)
- Use ElevenLabs Flash v2.5 (fastest TTS)
- Implement streaming
- Reduce context window

#### Audio stuttering
- Increase buffer size
- Use audio streaming instead of full download
- Check network speed
- Reduce audio quality if needed

---

### 🔍 Debugging Tips

#### Enable verbose logging

**Frontend:**
```javascript
// In src/lib/api.js
console.log('Sending request:', { sessionId, persona })
const response = await fetch(...)
console.log('Response status:', response.status)
```

**Backend:**
```python
# In backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)

@app.post("/api/chat")
async def handle_chat(...):
    logging.debug(f"Received audio: {len(content)} bytes")
    logging.debug(f"Transcription: {user_text}")
    logging.debug(f"AI response: {ai_text}")
```

#### Check browser console
- Open DevTools (F12)
- Console tab for errors
- Network tab for API calls
- Application tab for storage/auth

#### Check backend logs
```bash
# Backend terminal shows all requests
# Look for error stack traces
```

---

### 📱 Browser Compatibility

#### Recommended Browsers
- ✅ Chrome 90+
- ✅ Edge 90+
- ⚠️ Firefox 88+ (some audio issues)
- ⚠️ Safari 14+ (limited MediaRecorder support)

#### Safari-specific issues
```javascript
// Use polyfill for MediaRecorder
import { MediaRecorder } from 'audio-recorder-polyfill'
```

---

### 🆘 Still Stuck?

#### Check logs systematically
1. Browser console (F12)
2. Backend terminal
3. Supabase logs (Dashboard → Logs)
4. Network tab (check API responses)

#### Minimal reproduction
```bash
# Test each component separately
1. Test auth: Can you sign up/login?
2. Test database: Can you see tables in Supabase?
3. Test backend: Visit http://localhost:8000/docs
4. Test APIs: Use Postman/Insomnia to test endpoints
5. Test frontend: Check if components render
```

#### Reset everything
```bash
# Nuclear option - start fresh
rm -rf node_modules venv .next
npm install
cd backend && python -m venv venv && pip install -r requirements.txt
```

---

### 📞 Get Help

1. **Check documentation**: README.md, QUICKSTART.md
2. **Search issues**: GitHub Issues (if repo is public)
3. **API docs**: 
   - Groq: https://console.groq.com/docs
   - Gemini: https://ai.google.dev/docs
   - ElevenLabs: https://elevenlabs.io/docs
   - Supabase: https://supabase.com/docs

---

**Remember:** 90% of issues are environment/API key problems. Double-check your .env files first!
