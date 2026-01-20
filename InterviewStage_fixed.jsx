'use client'
import { Mic, Volume2, Square, RotateCcw, Upload, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import VoiceWaveform from './VoiceWaveform'

export default function InterviewStage({ selectedPersona, onStartSpeaking, isLive, onOpenVoiceLab, onNewConversation, user }) {
  const [rotation, setRotation] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [interviewTopic, setInterviewTopic] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [sourceFile, setSourceFile] = useState(null)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const currentAudioRef = useRef(null)
  const sessionIdRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const getPersonaColor = () => selectedPersona?.color || '#45D6FF'

  const stopCurrentAction = () => {
    console.log('Stopping current action...')
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }
    
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    setIsRecording(false)
    setIsAISpeaking(false)
    setAudioLevel(0)
    
    // Auto-start recording if interview is active and AI was speaking
    if (isInterviewActive && !isRecording) {
      setTimeout(() => startRecording(), 500)
    }
  }

  const restartInterview = () => {
    console.log('Restarting interview...')
    stopCurrentAction()
    setSessionId(null)
    sessionIdRef.current = null
    localStorage.removeItem('ivy_session_id')
    setIsInterviewActive(false)
    setTimeout(() => startConversation(), 300)
  }

  const handleSourceUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (allowedTypes.includes(file.type)) {
        setSourceFile(file)
      } else {
        alert('Please upload a PDF, DOCX, or TXT file')
      }
    }
  }

  const removeSourceFile = () => setSourceFile(null)

  const endInterview = async () => {
    if (!sessionIdRef.current && !localStorage.getItem('ivy_session_id')) {
      alert('No active interview to end')
      return
    }
    
    // Terminate all interview actions immediately
    setIsInterviewActive(false)
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }
    
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    setIsRecording(false)
    setAudioLevel(0)
    
    // AI says thank you
    setIsAISpeaking(true)
    const thankYouMsg = "Thank you for the interview. It was great talking with you!"
    
    try {
      const ttsResponse = await fetch('http://localhost:3001/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: thankYouMsg,
          persona_name: selectedPersona.name
        })
      })
      
      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        currentAudioRef.current = audio
        
        audio.onended = () => {
          setIsAISpeaking(false)
          URL.revokeObjectURL(audioUrl)
          currentAudioRef.current = null
          // Start analysis after thank you
          proceedWithAnalysis()
        }
        
        await audio.play()
      } else {
        setIsAISpeaking(false)
        proceedWithAnalysis()
      }
    } catch (error) {
      console.error('Thank you TTS failed:', error)
      setIsAISpeaking(false)
      proceedWithAnalysis()
    }
  }
  
  const proceedWithAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      const currentSessionId = sessionIdRef.current || localStorage.getItem('ivy_session_id')
      const response = await fetch('http://localhost:3001/api/interview/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSessionId })
      })
      
      if (response.ok) {
        const analysis = await response.json()
        setAnalysisResult(analysis)
        setShowThankYou(true)
        
        if (typeof onNewConversation === 'function') {
          const newConversation = {
            title: interviewTopic || 'General Interview',
            persona: selectedPersona?.name || 'AI',
            messageCount: analysis.conversation_history?.length || 0,
            analysis: analysis,
            conversation: analysis.conversation_history || [],
            date: new Date()
          }
          onNewConversation(newConversation)
        }
      }
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const viewAnalysis = () => {
    setShowThankYou(false)
  }

  const startNewInterview = () => {
    setShowThankYou(false)
    setAnalysisResult(null)
    setSessionId(null)
    sessionIdRef.current = null
    localStorage.removeItem('ivy_session_id')
    setIsInterviewActive(false)
  }

  const startConversation = async () => {
    if (!sourceFile && !interviewTopic.trim()) {
      alert('Please enter an interview topic or upload a source file!')
      return
    }
    
    // Validate persona
    if (!selectedPersona || !selectedPersona.name || selectedPersona.name.trim() === '') {
      alert('Please select a valid persona first!')
      return
    }
    
    if (selectedPersona.isCustom && !selectedPersona.hasVoice && selectedPersona.name === 'Custom Persona') {
      alert('Please complete voice cloning for this custom persona first!')
      return
    }
    
    const finalTopic = interviewTopic.trim() || (sourceFile ? 'Document-based Interview' : '')
    
    if (!finalTopic) {
      alert('Please enter an interview topic!')
      return
    }
    
    try {
      // Check backend health first
      const healthCheck = await fetch('http://localhost:3001/health')
      if (!healthCheck.ok) {
        throw new Error('Backend service unavailable')
      }
      
      setIsInterviewActive(true)
      
      const formData = new FormData()
      formData.append('persona_name', selectedPersona.name.trim())
      formData.append('interview_topic', finalTopic)
      formData.append('user_id', user?.id || 'anonymous')
      
      if (sourceFile) {
        formData.append('source_file', sourceFile)
      }
      
      const response = await fetch('http://localhost:3001/api/interview/start', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Server error: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.session_id) {
        throw new Error('Backend failed to create session')
      }
      
      console.log('✅ Session created:', result.session_id)
      setSessionId(result.session_id)
      sessionIdRef.current = result.session_id
      localStorage.setItem('ivy_session_id', result.session_id)
      
      if (result.detected_topic && result.detected_topic !== interviewTopic) {
        setInterviewTopic(result.detected_topic)
      }
      
      setIsAISpeaking(true)
      
      // Use backend TTS with custom voice instead of browser speech synthesis
      try {
        const ttsResponse = await fetch('http://localhost:3001/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: result.message,
            persona_name: selectedPersona.name
          })
        })
        
        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          
          currentAudioRef.current = audio
          
          audio.onended = () => {
            setIsAISpeaking(false)
            URL.revokeObjectURL(audioUrl)
            setTimeout(() => {
              const currentSessionId = sessionIdRef.current || localStorage.getItem('ivy_session_id')
              if (currentSessionId) {
                startRecording()
              } else {
                console.error('Session ID not available for recording')
              }
            }, 1500)
          }
          
          audio.onerror = (e) => {
            console.error('Audio playback error:', e)
            setIsAISpeaking(false)
            setTimeout(() => startRecording(), 1500)
          }
          
          await audio.play()
        } else {
          throw new Error(`TTS failed: ${ttsResponse.status}`)
        }
      } catch (error) {
        console.error('TTS Error, falling back to speech synthesis:', error)
        const utterance = new SpeechSynthesisUtterance(result.message)
        
        utterance.onend = () => {
          setIsAISpeaking(false)
          setTimeout(() => {
            const currentSessionId = sessionIdRef.current || localStorage.getItem('ivy_session_id')
            if (currentSessionId) {
              startRecording()
            } else {
              console.error('Session ID not available for recording')
            }
          }, 1500)
        }
        
        utterance.onerror = (e) => {
          console.error('Speech synthesis error:', e)
          setIsAISpeaking(false)
          setTimeout(() => startRecording(), 1500)
        }
        
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Failed to start interview:', error)
      alert(`Failed to start interview: ${error.message}`)
      setIsInterviewActive(false)
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
      
      const detectSilence = () => {
        if (!isRecordingActive) return
        
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteFrequencyData(dataArray)
        
        const average = dataArray.reduce((a, b) => a + b) / bufferLength
        setAudioLevel(average)
        
        if (average < 15) {
          if (!silenceStart) {
            silenceStart = Date.now()
            console.log('🔇 Silence detected, waiting for voice...')
          } else if (Date.now() - silenceStart > 3000) {
            console.log('🛑 Recording stopped due to silence')
            stopRecording()
            return
          }
        } else {
          if (silenceStart) {
            console.log('🎤 Voice detected, continuing recording...')
          }
          silenceStart = null
        }
        
        setTimeout(detectSilence, 100)
      }
      
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorderRef.current.onstop = async () => {
        console.log('🛑 Recording stopped - processing audio...')
        isRecordingActive = false
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        console.log(`🎧 Audio captured: ${audioBlob.size} bytes`)
        if (audioBlob.size > 1000) {
          await sendAudioToAI(audioBlob)
        } else {
          console.log('⚠️ Audio too small, restarting recording...')
          setTimeout(() => startRecording(), 1000)
        }
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
        setAudioLevel(0)
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      onStartSpeaking()
      console.log('🎤 Recording started - listening for user input...')
      
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
      const currentSessionId = sessionIdRef.current || localStorage.getItem('ivy_session_id')
      console.log('Current session ID:', currentSessionId)
      
      if (!currentSessionId) {
        throw new Error('No active session - please restart interview')
      }
      
      const formData = new FormData()
      formData.append('audio_file', audioBlob, 'user_response.wav')
      formData.append('session_id', currentSessionId)
      
      const response = await fetch('http://localhost:3001/api/interview/chat', {
        method: 'POST',
        body: formData
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('🤖 AI Response:', result.message)
      console.log('👤 User said:', result.transcription)
      
      setIsAISpeaking(true)
      
      // Use backend TTS with custom voice instead of browser speech synthesis
      try {
        const ttsResponse = await fetch('http://localhost:3001/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: result.message,
            persona_name: selectedPersona.name
          })
        })
        
        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          
          currentAudioRef.current = audio
          
          audio.onended = () => {
            setIsAISpeaking(false)
            URL.revokeObjectURL(audioUrl)
            setTimeout(() => {
              const currentSessionId = sessionIdRef.current || localStorage.getItem('ivy_session_id')
              if (!isRecording && isInterviewActive && currentSessionId) {
                startRecording()
              } else if (!currentSessionId) {
                console.error('Session ID not available for recording')
              }
            }, 1500)
          }
          
          audio.onerror = (e) => {
            console.error('Audio playback error:', e)
            setIsAISpeaking(false)
            setTimeout(() => {
              if (!isRecording && isInterviewActive) startRecording()
            }, 1500)
          }
          
          await audio.play()
        } else {
          throw new Error(`TTS failed: ${ttsResponse.status}`)
        }
      } catch (error) {
        console.error('TTS Error, falling back to speech synthesis:', error)
        const utterance = new SpeechSynthesisUtterance(result.message)
        
        utterance.onend = () => {
          setIsAISpeaking(false)
          setTimeout(() => {
            if (!isRecording && isInterviewActive) {
              startRecording()
            }
          }, 1500)
        }
        
        utterance.onerror = (e) => {
          console.error('Speech synthesis error:', e)
          setIsAISpeaking(false)
          setTimeout(() => {
            if (!isRecording && isInterviewActive) {
              startRecording()
            }
          }, 1500)
        }
        
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('sendAudioToAI error:', error.message)
      alert(`Communication error: ${error.message}`)
      setTimeout(() => {
        if (!isRecording && isInterviewActive) startRecording()
      }, 3000)
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-3">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div 
          className="absolute inset-[-20px] rounded-full transition-all duration-500"
          style={{
            background: `radial-gradient(circle, ${getPersonaColor()}12 0%, transparent 70%)`,
            opacity: 0.4
          }}
        />
        
        <div 
          className="absolute inset-0 w-[140px] h-[140px] rounded-full transition-all duration-500"
          style={{
            border: `1.5px solid ${getPersonaColor()}`,
            opacity: 0.4,
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.1s linear, border-color 0.5s ease'
          }}
        />
        
        <div className="relative w-[140px] h-[140px] rounded-full flex items-center justify-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 overflow-hidden"
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
              <span className="text-white font-bold text-lg">{selectedPersona?.name?.[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Topic Input */}
      {!isInterviewActive && (
        <div className="text-center mb-2 flex-shrink-0">
          <input
            type="text"
            placeholder="Interview topic (e.g., Software Engineer)"
            value={interviewTopic}
            onChange={(e) => setInterviewTopic(e.target.value)}
            className="w-full max-w-xs px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#DCE6F1] placeholder-[#5C6678] focus:outline-none focus:border-[#45D6FF] transition-all text-xs"
          />
        </div>
      )}

      {/* File Upload */}
      {!isInterviewActive && (
        <div className="mb-3 flex-shrink-0">
          <div className="text-center mb-2">
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] text-primary font-medium text-xs transition-all cursor-pointer">
              <Upload size={12} className="icon-inactive" />
              Source Content
              <input 
                type="file" 
                accept=".pdf,.docx,.txt" 
                onChange={handleSourceUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-description mt-1">Upload content for questions</p>
          </div>
          
          {sourceFile && (
            <div className="flex items-center justify-center gap-2 px-2 py-1 bg-[rgba(69,214,255,0.1)] border border-[rgba(69,214,255,0.2)] rounded-lg text-xs">
              <span className="text-[#45D6FF] truncate max-w-[150px]">{sourceFile.name}</span>
              <button 
                onClick={removeSourceFile}
                className="text-[#45D6FF] hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Persona Info */}
      <div className="text-center flex-shrink-0">
        <h3 className="text-lg font-semibold text-primary mb-1">
          {selectedPersona?.name || 'Select Persona'}
        </h3>
        <p className="text-xs uppercase tracking-wider text-description mb-2">
          {selectedPersona?.role || 'No role selected'}
        </p>
        
        <div className="mb-2 flex justify-center">
          <VoiceWaveform 
            isActive={isRecording || isLive}
            audioLevel={audioLevel}
            color={getPersonaColor()}
            isAISpeaking={isAISpeaking}
          />
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500" style={{ borderColor: `${getPersonaColor()}60`, background: 'transparent' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-breathe transition-all duration-500" style={{ background: getPersonaColor() }} />
          <span className="text-xs text-secondary">{isAISpeaking ? 'AI SPEAKING' : isRecording ? 'LISTENING' : 'READY'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 items-center flex-shrink-0">
        {showThankYou ? (
          <div className="text-center">
            <div className="mb-4 p-4 rounded-lg bg-[rgba(69,214,255,0.1)] border border-[rgba(69,214,255,0.2)]">
              <h3 className="text-lg font-semibold text-[#45D6FF] mb-2">Thank You!</h3>
              <p className="text-sm text-secondary mb-3">Thank you for taking the interview.</p>
              <p className="text-xs text-description">You can check your analysis here</p>
            </div>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={viewAnalysis}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-[#45D6FF] hover:bg-[#5E6BFF] text-white transition-all"
              >
                View Analysis
              </button>
              <button 
                onClick={startNewInterview}
                className="px-4 py-2 rounded-lg font-medium text-sm border border-[rgba(255,255,255,0.2)] text-primary hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                New Interview
              </button>
            </div>
          </div>
        ) : analysisResult ? (
          <div className="w-full max-w-md max-h-[70vh] overflow-y-auto">
            <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
              <h3 className="text-lg font-semibold text-[#45D6FF] mb-3">Interview Analysis</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-primary">Overall Score: </span>
                  <span className="text-lg font-bold text-[#45D6FF]">{analysisResult.overall_score}/100</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-primary block mb-1">Strengths:</span>
                  <p className="text-xs text-secondary">{analysisResult.strengths}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-primary block mb-1">Areas for Improvement:</span>
                  <p className="text-xs text-secondary">{analysisResult.improvements}</p>
                </div>
              </div>
              <button 
                onClick={startNewInterview}
                className="w-full mt-4 px-4 py-2 rounded-lg font-medium text-sm bg-green-600 hover:bg-green-700 text-white transition-all"
              >
                Start New Interview
              </button>
            </div>
          </div>
        ) : !isInterviewActive ? (
          <>
            <button 
              onClick={onOpenVoiceLab}
              className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] text-primary font-medium text-xs transition-all flex items-center gap-1.5"
            >
              <Mic size={12} className="icon-inactive" />
              Voice Lab
            </button>
            
            <button 
              onClick={startConversation}
              disabled={!sourceFile && !interviewTopic.trim() || (selectedPersona?.isCustom && !selectedPersona?.hasVoice && selectedPersona?.name === 'Custom Persona')}
              className="px-4 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-lg hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${getPersonaColor()}, #5E6BFF)`,
                color: 'rgba(220, 230, 241, 1)'
              }}
            >
              {selectedPersona?.isCustom && !selectedPersona?.hasVoice && selectedPersona?.name === 'Custom Persona' 
                ? 'Complete Voice Setup First' 
                : 'Start Interview'
              }
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={stopCurrentAction}
              className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
            >
              <Square size={12} />
              {isAISpeaking ? 'Stop AI' : isRecording ? 'Stop Listening' : 'Stop'}
            </button>
            
            <button 
              onClick={restartInterview}
              className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.1)] text-primary"
            >
              <RotateCcw size={12} />
              Restart
            </button>
            
            <button 
              onClick={endInterview}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'End Interview'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}