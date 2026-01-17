'use client'
import { Mic, Volume2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function InterviewStage({ selectedPersona, onStartSpeaking, isLive, onOpenVoiceLab }) {
  const [rotation, setRotation] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [conversationStarted, setConversationStarted] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const getPersonaColor = () => {
    return selectedPersona?.color || '#45D6FF'
  }

  const startConversation = async () => {
    if (!conversationStarted) {
      setConversationStarted(true)
      const greeting = `Hello! I'm ${selectedPersona.name}. I'm here to help you practice your interview skills. What topic or domain would you like to focus on today?`
      await playAIResponse(greeting)
    }
    toggleRecording()
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      const chunks = []
      
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        await sendAudioToAI(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      onStartSpeaking()
      
    } catch (error) {
      console.error('Recording failed:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const sendAudioToAI = async (audioBlob) => {
    try {
      console.log('Sending audio to AI...', audioBlob.size, 'bytes')
      
      const formData = new FormData()
      formData.append('audio_file', audioBlob, 'audio.wav')
      formData.append('persona', selectedPersona.name)
      formData.append('session_id', 'current_session')
      formData.append('user_id', 'current_user')
      
      const response = await fetch('http://localhost:8002/api/chat', {
        method: 'POST',
        body: formData
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('AI Response:', result.message)
      } else {
        const errorText = await response.text()
        console.error('API failed:', response.status, errorText)
      }
    } catch (error) {
      console.error('sendAudioToAI error:', error.message)
    }
  }

  const playAIResponse = async (text) => {
    console.log('AI says:', text)
    // For now, just log the response
    // TTS will be added back once working
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8">
      {/* Avatar Visualization */}
      <div className="relative">
        {/* Soft radial glow */}
        <div 
          className="absolute inset-[-40px] rounded-full transition-all duration-500"
          style={{
            background: `radial-gradient(circle, ${getPersonaColor()}12 0%, transparent 70%)`,
            opacity: 0.4
          }}
        />
        
        {/* Thin rotating ring */}
        <div 
          className="absolute inset-0 w-[260px] h-[260px] rounded-full transition-all duration-500"
          style={{
            border: `1.5px solid ${getPersonaColor()}`,
            opacity: 0.4,
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.1s linear, border-color 0.5s ease'
          }}
        />
        
        {/* Inner ring */}
        <div 
          className="absolute inset-[12px] rounded-full transition-all duration-500"
          style={{
            border: `1px solid ${getPersonaColor()}`,
            opacity: 0.15
          }}
        />
        
        {/* Avatar */}
        <div className="relative w-[260px] h-[260px] rounded-full flex items-center justify-center">
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center text-4xl transition-all duration-500 overflow-hidden"
            style={{
              background: `radial-gradient(circle, ${getPersonaColor()}18, transparent)`,
            }}
          >
            {selectedPersona?.avatar ? (
              <img 
                src={selectedPersona.avatar} 
                alt={selectedPersona.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <span className="text-white font-bold text-2xl">{selectedPersona?.name?.[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Persona Info */}
      <div className="text-center">
        <h3 className="text-[22px] font-semibold text-primary mb-1.5">
          {selectedPersona?.name || 'Select Persona'}
        </h3>
        <p className="text-[11px] uppercase tracking-wider text-description mb-3">
          {selectedPersona?.role || 'No role selected'}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-500" style={{ borderColor: `${getPersonaColor()}60`, background: 'transparent' }}>
          <div className="w-2 h-2 rounded-full animate-breathe transition-all duration-500" style={{ background: getPersonaColor() }} />
          <span className="text-[10px] text-secondary">READY</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button 
          onClick={onOpenVoiceLab}
          className="px-6 py-3 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] text-primary font-medium text-sm transition-all flex items-center gap-2"
        >
          <Mic size={14} className="icon-inactive" />
          Voice Lab
        </button>
        
        <button 
          onClick={startConversation}
          className="px-8 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
          style={{
            background: isRecording ? 'rgba(255,80,80,0.8)' : conversationStarted ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${getPersonaColor()}, #5E6BFF)`,
            border: (isRecording || conversationStarted) ? '1px solid rgba(255,255,255,0.1)' : 'none',
            color: 'rgba(220, 230, 241, 1)'
          }}
        >
          {isRecording ? (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Stop Recording
            </>
          ) : conversationStarted ? (
            <>
              <Mic size={14} />
              Start Recording
            </>
          ) : 'Start Interview'}
        </button>
      </div>
    </div>
  )
}
