import { supabase } from './supabaseClient.js';

export async function createInterviewSession({ user_id, persona_name, primary_topic }) {
  try {
    console.log('Creating session with params:', { user_id, persona_name, primary_topic });
    
    const title = primary_topic || `${persona_name} Interview`;
    
    // Skip profile creation entirely - just create the session
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id,
        title,
        persona_name
      })
      .select()
      .single();

    if (error) {
      console.error('Session creation error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full_error: error
      });
      throw error;
    }
    console.log('✅ Session created successfully:', data.id);
    return data.id;
  } catch (error) {
    console.error('Failed to create session - DETAILED ERROR:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    });
    return null;
  }
}

export async function getSession(sessionId) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

export async function addHistory(sessionId, role, content, audioUrl = null) {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        sender: role === 'user' ? 'user' : 'ai',
        content,
        audio_url: audioUrl
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to add message:', error);
    return false;
  }
}

export async function getSessionHistory(sessionId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
      audio_url: msg.audio_url
    }));
  } catch (error) {
    console.error('Failed to get session history:', error);
    return [];
  }
}

export async function getUserSessions(userId) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get user sessions:', error);
    return [];
  }
}

// Legacy compatibility
export function addToHistory(sessionId, userMessage, aiMessage) {
  return Promise.all([
    addHistory(sessionId, 'user', userMessage),
    addHistory(sessionId, 'assistant', aiMessage)
  ]);
}

export function getAllSessions() {
  console.warn('getAllSessions is deprecated - use getUserSessions instead');
  return {};
}