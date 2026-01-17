'use client'
import { Mic, Volume2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import VoiceWaveform from './VoiceWaveform'

export default function InterviewStage({ selectedPersona, onStartSpeaking, isLive, onOpenVoiceLab }) {
  const [rotation, setRotation] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [interviewTopic, setInterviewTopic] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
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
    if (!interviewTopic.trim()) {
      alert('Please enter an interview topic first!')
      return
    }
    
    try {
      const formData = new FormData()
      formData.append('user_id', 'current_user')
      formData.append('persona', selectedPersona.name)
      formData.append('interview_topic', interviewTopic)
      
      const response = await fetch('http://localhost:8006/api/interview/start', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const sessionId = response.headers.get('X-Session-ID')
        const message = response.headers.get('X-Message')
        
        if (sessionId) setSessionId(sessionId)
        
        // Play opening audio
        if (response.headers.get('content-type')?.includes('audio')) {
          setIsAISpeaking(true)
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          audio.play()
          audio.onended = () => {
            setIsAISpeaking(false)
            URL.revokeObjectURL(audioUrl)
            // Start recording after AI speaks
            setTimeout(() => {
              startRecording()
            }, 3000)
          }
        } else {
          const result = await response.json()
          if (result.session_id) setSessionId(result.session_id)
          
          // Use speech synthesis for opening message
          if (result.message) {
            const utterance = new SpeechSynthesisUtterance(result.message)
            utterance.rate = 0.9
            utterance.pitch = 1.0
            utterance.volume = 0.8
            
            utterance.onend = () => {
              setTimeout(() => {
                startRecording()
              }, 2000)
            }
            
            speechSynthesis.speak(utterance)
          } else {
            // Start recording immediately if no message
            setTimeout(() => {
              startRecording()
            }, 1000)
          }
        }
      }
    } catch (error) {
      console.error('Failed to start interview:', error)
    }
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
      console.log('Starting recording...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      const chunks = []
      let silenceStart = null
      let isRecordingActive = true
      
      // Audio level detection for auto-stop
      const detectSilence = () => {
        if (!isRecordingActive) return
        
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteFrequencyData(dataArray)
        
        const average = dataArray.reduce((a, b) => a + b) / bufferLength
        setAudioLevel(average)
        
        if (average < 15) { // Silence threshold
          if (!silenceStart) {
            silenceStart = Date.now()
          } else if (Date.now() - silenceStart > 5000) { // 5 seconds of silence
            console.log('Detected silence, stopping recording')
            stopRecording()
            return
          }
        } else {
          silenceStart = null
        }
        
        setTimeout(detectSilence, 100)
      }
      
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped')
        isRecordingActive = false
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        if (audioBlob.size > 1000) { // Only send if there's actual audio
          await sendAudioToAI(audioBlob)
        } else {
          console.log('Audio too small, restarting recording')
          setTimeout(() => startRecording(), 1000)
        }
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
        setAudioLevel(0)
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      onStartSpeaking()
      
      // Start silence detection after 1 second
      setTimeout(detectSilence, 1000)
      
    } catch (error) {
      console.error('Recording failed:', error)
      setIsRecording(false)
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
      formData.append('session_id', sessionId || 'default_session')
      formData.append('user_id', 'current_user')
      formData.append('interview_topic', interviewTopic)
      
      const response = await fetch('http://localhost:8006/api/chat', {
        method: 'POST',
        body: formData
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('audio')) {
          // Play AI audio response
          setIsAISpeaking(true)
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          
          audio.onloadeddata = () => {
            console.log('Playing AI response audio')
            audio.play().catch(e => console.error('Audio play failed:', e))
          }
          
          audio.onended = () => {
            console.log('AI finished speaking, waiting for user...')
            setIsAISpeaking(false)
            URL.revokeObjectURL(audioUrl)
            // Wait 3 seconds then start listening for user
            setTimeout(() => {
              if (!isRecording) {
                console.log('Starting user recording...')
                startRecording()
              }
            }, 3000)
          }
          
        } else {
          // Handle text-only response with speech synthesis fallback
          const result = await response.json()
          console.log('AI Response (text only):', result.message)
          
          // Use browser speech synthesis as fallback
          const utterance = new SpeechSynthesisUtterance(result.message)
          utterance.rate = 0.9
          utterance.pitch = 1.0
          utterance.volume = 0.8
          
          utterance.onend = () => {
            console.log('Speech synthesis finished')
            setTimeout(() => {
              if (!isRecording) startRecording()
            }, 1000)
          }
          
          speechSynthesis.speak(utterance)
        }
      } else {
        const errorText = await response.text()
        console.error('API failed:', response.status, errorText)
        // Restart recording on error
        setTimeout(() => {
          if (!isRecording) startRecording()
        }, 3000)
      }
    } catch (error) {
      console.error('sendAudioToAI error:', error.message)
      // Restart recording on error
      setTimeout(() => {
        if (!isRecording) startRecording()
      }, 3000)
    }
  }

  const playAIResponse = async (text) => {
    console.log('AI says:', text)
    
    // Use natural system voice for greeting
    const utterance = new SpeechSynthesisUtterance(text)
    
    const voices = speechSynthesis.getVoices()
    const systemVoice = voices.find(voice => 
      voice.default || 
      voice.localService ||
      voice.name.includes('Microsoft')
    )
    
    if (systemVoice) {
      utterance.voice = systemVoice
    }
    
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 0.8
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 py-4">
      {/* Avatar Visualization */}
      <div className="relative flex-shrink-0">
        {/* Soft radial glow */}
        <div 
          className="absolute inset-[-30px] rounded-full transition-all duration-500"
          style={{
            background: `radial-gradient(circle, ${getPersonaColor()}12 0%, transparent 70%)`,
            opacity: 0.4
          }}
        />
        
        {/* Thin rotating ring */}
        <div 
          className="absolute inset-0 w-[200px] h-[200px] rounded-full transition-all duration-500"
          style={{
            border: `1.5px solid ${getPersonaColor()}`,
            opacity: 0.4,
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.1s linear, border-color 0.5s ease'
          }}
        />
        
        {/* Inner ring */}
        <div 
          className="absolute inset-[10px] rounded-full transition-all duration-500"
          style={{
            border: `1px solid ${getPersonaColor()}`,
            opacity: 0.15
          }}
        />
        
        {/* Avatar */}
        <div className="relative w-[200px] h-[200px] rounded-full flex items-center justify-center">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl transition-all duration-500 overflow-hidden"
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
              <span className="text-white font-bold text-xl">{selectedPersona?.name?.[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Interview Topic Input */}
      <div className="text-center mb-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Interview topic (e.g., Software Engineer)"
          value={interviewTopic}
          onChange={(e) => setInterviewTopic(e.target.value)}
          className="w-full max-w-xs px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#DCE6F1] placeholder-[#5C6678] focus:outline-none focus:border-[#45D6FF] transition-all text-xs"
        />
      </div>

      {/* Persona Info */}
      <div className="text-center flex-shrink-0">
        <h3 className="text-[20px] font-semibold text-primary mb-1">
          {selectedPersona?.name || 'Select Persona'}
        </h3>
        <p className="text-[10px] uppercase tracking-wider text-description mb-3">
          {selectedPersona?.role || 'No role selected'}
        </p>
        
        {/* Voice Waveform */}
        <div className="mb-3 flex justify-center">
          <VoiceWaveform 
            isActive={isRecording || isLive}
            audioLevel={audioLevel}
            color={getPersonaColor()}
            isAISpeaking={isAISpeaking}
          />
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-500" style={{ borderColor: `${getPersonaColor()}60`, background: 'transparent' }}>
          <div className="w-2 h-2 rounded-full animate-breathe transition-all duration-500" style={{ background: getPersonaColor() }} />
          <span className="text-[10px] text-secondary">{isAISpeaking ? 'AI SPEAKING' : isRecording ? 'LISTENING' : 'READY'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-shrink-0">
        <button 
          onClick={onOpenVoiceLab}
          className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] text-primary font-medium text-sm transition-all flex items-center gap-2"
        >
          <Mic size={14} className="icon-inactive" />
          Voice Lab
        </button>
        
        <button 
          onClick={startConversation}
          disabled={!interviewTopic.trim() || isRecording || isAISpeaking}
          className="px-6 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
          style={{
            background: isRecording ? 'rgba(255,80,80,0.8)' : sessionId ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${getPersonaColor()}, #5E6BFF)`,
            border: (isRecording || sessionId) ? '1px solid rgba(255,255,255,0.1)' : 'none',
            color: 'rgba(220, 230, 241, 1)'
          }}
        >
          {isAISpeaking ? (
            <>
              <Volume2 size={14} className="animate-pulse" />
              AI Speaking...
            </>
          ) : isRecording ? (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Listening...
            </>
          ) : sessionId ? (
            <>
              <Mic size={14} />
              Continue Interview
            </>
          ) : 'Start Interview'}
        </button>
      </div>
    </div>
  )
}
