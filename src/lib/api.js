const API_BASE = 'http://localhost:8000'

export const api = {
  async chat(sessionId, persona, userId, audioBlob) {
    const formData = new FormData()
    formData.append('session_id', sessionId)
    formData.append('persona', persona)
    formData.append('user_id', userId)
    formData.append('audio_file', audioBlob, 'audio.wav')

    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Chat API failed')
    return response.blob() // Audio response
  },

  async cloneVoice(userId, voiceName, audioBlob) {
    const formData = new FormData()
    formData.append('user_id', userId)
    formData.append('voice_name', voiceName)
    formData.append('audio_file', audioBlob, 'voice.wav')

    const response = await fetch(`${API_BASE}/api/voice/clone`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Voice cloning failed')
    return response.json()
  },

  async createSession(userId, persona) {
    const formData = new FormData()
    formData.append('user_id', userId)
    formData.append('persona', persona)

    const response = await fetch(`${API_BASE}/api/session/create`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Session creation failed')
    return response.json()
  },

  async getSessions(userId) {
    const response = await fetch(`${API_BASE}/api/sessions/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch sessions')
    return response.json()
  }
}
