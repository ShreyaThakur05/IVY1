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

  const endInterview = async () => {
    if (!sessionIdRef.current && !localStorage.getItem('ivy_session_id')) {
      alert('No active interview to end')
      return
    }
    
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
    setIsAISpeaking(false)
    
    setTimeout(() => {
      setIsAISpeaking(true)
      const thankYouMsg = "Thank you for the interview. It was great talking with you!"
      const utterance = new SpeechSynthesisUtterance(thankYouMsg)
      
      utterance.onend = () => {
        setIsAISpeaking(false)
        setIsInterviewActive(false)
        setIsRecording(false)
        setAudioLevel(0)
        sessionIdRef.current = null
        localStorage.removeItem('ivy_session_id')
        
        if (currentAudioRef.current) {
          currentAudioRef.current.pause()
          currentAudioRef.current = null
        }
        
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
        
        proceedWithAnalysis()
      }
      
      utterance.onerror = () => {
        setIsAISpeaking(false)
        proceedWithAnalysis()
      }
      
      speechSynthesis.speak(utterance)
    }, 500)
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

  const startNewInterview = () => {
    setAnalysisResult(null)
    setSessionId(null)
    sessionIdRef.current = null
    localStorage.removeItem('ivy_session_id')
    setIsInterviewActive(false)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-3">
      {analysisResult ? (
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
      ) : (
        <div className="text-center">
          <p className="text-primary mb-4">Interview interface placeholder</p>
          <button 
            onClick={endInterview}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'End Interview (Test)'}
          </button>
        </div>
      )}
    </div>
  )
}