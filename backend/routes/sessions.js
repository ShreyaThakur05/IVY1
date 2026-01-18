import express from 'express';
import { createInterviewSession, getUserSessions, getSession, getSessionHistory } from '../services/interviewSession.js';

const router = express.Router();

// Create new session
router.post('/create', async (req, res) => {
  try {
    const { user_id, persona_name, primary_topic, document_reference } = req.body;
    
    if (!user_id || !persona_name) {
      return res.status(400).json({ error: 'user_id and persona_name are required' });
    }

    const sessionId = await createInterviewSession({
      user_id,
      persona_name,
      primary_topic,
      document_reference
    });

    if (!sessionId) {
      return res.status(500).json({ error: 'Failed to create session' });
    }

    res.json({ session_id: sessionId });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user sessions
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await getUserSessions(userId);
    res.json({ sessions });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session details
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const history = await getSessionHistory(sessionId);
    res.json({ ...session, history });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;