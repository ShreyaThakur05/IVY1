'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import InterviewStage from '@/components/InterviewStage'
import VoiceLab from '@/components/VoiceLab'
import Auth from '@/components/Auth'
import { PERSONAS } from '@/lib/personas'
import { supabase } from '@/lib/supabase'
import '@/styles/globals.css'

export default function Home() {
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([
    { id: 0, title: 'React Performance Viva' },
    { id: 1, title: 'Google Behavioral Round' },
    { id: 2, title: 'System Design: WhatsApp' },
    { id: 3, title: 'Leadership Scenario Prep' },
  ])
  const [activeSession, setActiveSession] = useState(0)
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0])
  const [isVoiceLabOpen, setIsVoiceLabOpen] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [voices, setVoices] = useState([
    { id: 1, name: 'Shambhu', description: 'Technical Architect' },
    { id: 2, name: 'Shreyas', description: 'HR Director' },
    { id: 3, name: 'Shreya', description: 'Product Manager' },
  ])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleNewInterview = () => {
    const newSession = {
      id: sessions.length,
      title: `Interview ${sessions.length + 1}`
    }
    setSessions([newSession, ...sessions])
    setActiveSession(newSession.id)
  }

  const handleRenameSession = (sessionId, newTitle) => {
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, title: newTitle } : s))
  }

  const handleStartSpeaking = () => {
    setIsLive(!isLive)
  }

  const handleVoiceCloned = () => {
    const newVoice = {
      id: voices.length + 1,
      name: 'My Voice',
      description: 'Custom cloned voice'
    }
    setVoices([...voices, newVoice])
    setTimeout(() => setIsVoiceLabOpen(false), 1500)
  }

  if (!user) {
    return <Auth onAuthSuccess={setUser} />
  }

  return (
    <div className="flex h-screen bg-[#050507] text-slate-200 font-sans">
      
      <Sidebar 
        sessions={sessions}
        activeSession={activeSession}
        onSessionClick={setActiveSession}
        onNewInterview={handleNewInterview}
        onRenameSession={handleRenameSession}
        user={user}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/5 blur-[120px] rounded-full" />

        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800/30 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-slate-500">Session Active</span>
          </div>
          <div className="text-xs text-slate-600 font-mono">
            {new Date().toLocaleTimeString()}
          </div>
        </header>

        <div className="flex-1 flex flex-col p-8 z-10">
          <div className="max-w-7xl w-full mx-auto">
            <header className="text-center mb-8">
              <h2 className="text-3xl font-black text-white mb-2">Interview Practice</h2>
              <p className="text-slate-500 text-sm">Select a voice and start your session</p>
            </header>

            <InterviewStage 
              selectedPersona={selectedPersona}
              onStartSpeaking={handleStartSpeaking}
              isLive={isLive}
              voices={voices}
              onVoiceSelect={(voice) => console.log('Selected:', voice)}
              onOpenVoiceLab={() => setIsVoiceLabOpen(true)}
            />
          </div>
        </div>
      </main>

      <VoiceLab 
        isOpen={isVoiceLabOpen}
        onClose={() => setIsVoiceLabOpen(false)}
        onVoiceCloned={handleVoiceCloned}
      />
    </div>
  )
}
