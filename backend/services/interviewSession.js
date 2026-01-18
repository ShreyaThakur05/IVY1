import { supabase } from './supabaseClient.js';

export async function createInterviewSession({ user_id, persona_name, primary_topic, document_reference }) {
  try {
    const title = primary_topic || `${persona_name} Interview`;
    
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id,
        title,
        persona_name,
        interview_mode: 'Interview',
        primary_topic,
        document_reference
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Failed to create session:', error);
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