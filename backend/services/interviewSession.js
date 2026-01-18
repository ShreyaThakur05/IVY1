import { v4 as uuidv4 } from "uuid";

const sessions = new Map();

export function createInterviewSession({ persona_name, context }) {
  const sessionId = uuidv4();
  
  if (!sessionId) {
    console.error('Failed to generate session ID');
    return null;
  }
  
  sessions.set(sessionId, {
    id: sessionId,
    persona_name,
    context,
    history: [],
    createdAt: Date.now()
  });

  return sessionId;
}

export function getSession(sessionId) {
  return sessions.get(sessionId);
}

export function addHistory(sessionId, role, content) {
  const session = sessions.get(sessionId);
  if (session) {
    session.history.push({ role, content });
    // Keep history manageable (last 10 turns)
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }
  }
}

// Legacy compatibility functions
export function addToHistory(sessionId, userMessage, aiMessage) {
  addHistory(sessionId, 'user', userMessage);
  addHistory(sessionId, 'assistant', aiMessage);
}

export function getAllSessions() {
  return Object.fromEntries(sessions);
}