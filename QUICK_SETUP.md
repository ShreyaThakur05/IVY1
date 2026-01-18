# 🚀 IVY Quick Setup Guide

## ✅ Critical Issues Fixed

- ❌ **Python backend conflict** → ✅ **Disabled, Node.js only**
- ❌ **Insecure CORS** → ✅ **Secure CORS configuration**
- ❌ **No error handling** → ✅ **Comprehensive error handling**
- ❌ **Lost voice storage** → ✅ **Persistent voice storage**
- ❌ **Audio format issues** → ✅ **Enhanced audio handling**
- ❌ **No validation** → ✅ **Environment validation**

## 🏃‍♂️ Quick Start

### 1. Run the Setup Script
```bash
# Windows
start_ivy.bat

# This will:
# - Check Node.js installation
# - Install dependencies
# - Validate environment variables
# - Start both frontend and backend
```

### 2. Verify Backend Health
```bash
cd backend
npm run health
# Should show: ✅ All services running
```

### 3. Test the System
```bash
cd backend
node test-system.js
# Should show: 🎉 All tests passed!
```

## 🔧 Environment Setup

Your `backend/.env` should contain:
```env
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here  
ELEVENLABS_API_KEY=your_elevenlabs_key_here
OPENAI_API_KEY=your_openai_key_here (optional)
SUPABASE_URL=your_supabase_url (optional)
SUPABASE_KEY=your_supabase_key (optional)
```

## 🎯 Testing Voice Cloning

1. **Start the application**: `start_ivy.bat`
2. **Open**: http://localhost:3000
3. **Select a persona** from the carousel
4. **Click "Voice Lab"** button
5. **Record 10+ seconds** of audio or upload a file
6. **Fill in voice name and gender**
7. **Click "Clone Voice"**
8. **Verify**: Persona should show ✓ indicator

## 🐛 Troubleshooting

### Backend Won't Start
```bash
cd backend
npm run check-env
# Check for missing API keys
```

### Voice Cloning Fails
- Check ElevenLabs API key is valid
- Ensure audio is 10+ seconds long
- Try different audio formats (MP3, WAV, WebM)

### Frontend Can't Connect
- Verify backend is running on port 3001
- Check CORS settings in server.js
- Ensure no firewall blocking localhost:3001

### Audio Issues
- Grant microphone permissions in browser
- Try different browsers (Chrome recommended)
- Check audio input device settings

## 📊 System Status

### ✅ Working Features
- ✅ Voice recording and playback
- ✅ File upload (PDF, DOCX, TXT)
- ✅ AI conversation with RAG
- ✅ Voice cloning with ElevenLabs
- ✅ Persistent voice storage
- ✅ Error handling and recovery

### 🔄 Architecture
- **Frontend**: Next.js on port 3000
- **Backend**: Node.js/Express on port 3001
- **Storage**: File-based (voices.json)
- **AI**: Groq (STT), Gemini (LLM), ElevenLabs (TTS)

## 🆘 Support

If you encounter issues:

1. **Check logs** in both terminal windows
2. **Run health check**: `npm run health` in backend folder
3. **Test system**: `node test-system.js` in backend folder
4. **Verify environment**: `npm run check-env` in backend folder

## 🎉 Success Indicators

- ✅ Both servers start without errors
- ✅ Health check returns all services active
- ✅ Voice cloning shows success message
- ✅ Audio playback works in browser
- ✅ File uploads process correctly