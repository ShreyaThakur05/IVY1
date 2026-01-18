# Quick Start Guide - Premium Dashboard

## 🚀 Run the Application

### 1. Start Frontend (Terminal 1)
```bash
cd c:\Users\shrey\OneDrive\Desktop\ivy
npm run dev
```

### 2. Start Backend (Terminal 2)
```bash
cd c:\Users\shrey\OneDrive\Desktop\ivy\backend
python main.py
```

### 3. Open Browser
```
http://localhost:3000
```

## ✨ What You'll See

### Premium Dashboard Features
- **Top Navigation**: AI Interview Lab branding with tabs
- **Left Panel (60%)**: Voice arc with 3 preset personas
- **Right Panel (40%)**: Animated AI avatar
- **Glassmorphic Design**: Frosted glass effects throughout

### Try These Actions

#### 1. Select a Voice
- Hover over voice circles in the arc
- Click to select (watch the neon glow!)
- See waveform rings animate

#### 2. Add Your Voice
- Click "Record My Voice"
- Allow microphone access
- Record for 60 seconds (enforced)
- Watch your voice appear in the arc

#### 3. Start Interview
- Select a voice first
- Click "INITIATE LIVE INTERVIEW"
- Avatar glows with audio halo
- Equalizer bars animate

## 🎨 Design Highlights

### Animations
- ✨ Voice nodes float gently
- 💫 Avatar breathes when active
- 🌊 Waveforms pulse on selection
- 💍 Rings expand from selected voice
- ⚡ Smooth hover effects everywhere

### Glassmorphism
- Frosted glass panels
- Subtle inner shadows
- Neon glow on interactions
- Depth layering

### Color Scheme
- Deep charcoal background (#0B0F14)
- Indigo/purple gradients
- Cyan highlights
- Red for live/recording states

## 🔧 Troubleshooting

### Frontend won't start
```bash
# Reinstall dependencies
npm install
npm run dev
```

### Backend won't start
```bash
# Activate virtual environment
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Microphone not working
- Check browser permissions
- Allow microphone access when prompted
- Try Chrome/Edge (best compatibility)

## 📝 Current Status

### ✅ Working Features
- Premium UI with 60/40 layout
- Voice arc with 3 preset voices
- Voice selection with animations
- 60-second voice recording
- File upload for voices
- Live interview toggle
- Glassmorphic design system

### 🔄 Backend Integration Needed
- Voice cloning API connection
- Audio streaming for interviews
- Save custom voices to database
- Load user voices on login

## 🎯 Next Actions

1. **Test the UI**: Explore all animations and interactions
2. **Record a voice**: Try the 60-second recording
3. **Select voices**: See the arc animations
4. **Toggle live mode**: Watch the avatar transform

## 📚 Documentation

- **PREMIUM_DESIGN.md** - Complete design documentation
- **README.md** - Full project overview
- **GIT_SETUP.md** - Git push instructions

---

**Enjoy the premium interview experience! 🎤✨**
