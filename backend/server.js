import "./startup-check.js";
import "dotenv/config";
import express from "express";
import cors from "cors";
import interviewRoutes from "./routes/interview.js";
import ttsRoutes from "./routes/tts.js";
import voicesRoutes from "./routes/voices.js";
import stopRoutes from "./routes/stop.js";
import sessionsRoutes from "./routes/sessions.js";
import { getAllVoices } from "./services/voiceStorage.js";
import { getAllSessions } from "./services/interviewSession.js";

const app = express();

// Secure CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Routes
app.use("/api/interview", interviewRoutes);
app.use("/api", ttsRoutes);
app.use("/api/voices", voicesRoutes);
app.use("/api/stop", stopRoutes);
app.use("/api/sessions", sessionsRoutes);

// Debug routes
app.get("/api/debug/voices", (req, res) => {
  try {
    res.json({ voices: getAllVoices() });
  } catch (error) {
    console.error('Debug voices error:', error);
    res.status(500).json({ error: 'Failed to get voices' });
  }
});

app.get("/api/debug/sessions", (req, res) => {
  try {
    res.json({ sessions: getAllSessions() });
  } catch (error) {
    console.error('Debug sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Health check
app.get("/health", (req, res) => {
  const services = {
    groq: !!process.env.GROQ_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY
  };
  
  const allServicesReady = Object.values(services).every(Boolean);
  
  res.status(allServicesReady ? 200 : 503).json({ 
    status: allServicesReady ? "IVY backend running" : "Service unavailable",
    timestamp: new Date().toISOString(),
    services
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 IVY backend running on port ${PORT}`);
  console.log(`✅ Real AI Integration Active:`);
  console.log(`   - GROQ Whisper for STT`);
  console.log(`   - Gemini/GROQ for RAG responses`);
  console.log(`   - ElevenLabs for TTS`);
});