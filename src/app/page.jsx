'use client'
import { useState, useEffect } from 'react'
import InterviewStage from '@/components/InterviewStage'
import VoiceLab from '@/components/VoiceLab'
import HistoryPanel from '@/components/HistoryPanel'
import Auth from '@/components/Auth'
import { PERSONAS } from '@/lib/personas'
import { supabase } from '@/lib/supabase'
import '@/styles/globals.css'
import { History, ChevronDown, LogOut } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0])
  const [isVoiceLabOpen, setIsVoiceLabOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [customPersonas, setCustomPersonas] = useState([])
  const [allPersonas, setAllPersonas] = useState([...PERSONAS, {
    id: 'custom-initial',
    name: 'Custom Persona',
    role: 'Add Your Voice',
    color: '#666666',
    avatar: null,
    voiceId: null,
    isCustom: true,
    hasVoice: false
  }])
  const [voices, setVoices] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleNewConversation = (newConv) => {
    setConversations([newConv, ...conversations])
    setActiveConversation(newConv.id)
  }

  const handleAddConversation = () => {
    const newConv = {
      id: conversations.length + 1,
      title: `Interview ${conversations.length + 1}`,
      persona: selectedPersona.name,
      date: new Date(),
      messageCount: 0
    }
    setConversations([newConv, ...conversations])
    setActiveConversation(newConv.id)
  }

  const handleRenameConversation = (convId, newTitle) => {
    setConversations(conversations.map(c => c.id === convId ? { ...c, title: newTitle } : c))
  }

  const handleStartSpeaking = () => {
    setIsLive(!isLive)
  }

  const handleVoiceCloned = (voiceData) => {
    console.log('Voice cloned callback:', voiceData)
    console.log('Selected persona ID:', selectedPersona.id)
    
    // CRITICAL: Keep the same ID, only update properties
    const personaId = selectedPersona.id
    
    const updatedPersona = {
      ...selectedPersona,
      id: personaId,  // Ensure ID stays the same
      name: voiceData.voiceName,
      role: `Custom ${voiceData.gender === 'female' ? 'Female' : 'Male'} Voice`,
      avatar: voiceData.gender === 'female' ? '/assets/female-generic.jpg' : '/assets/male-generic.jpg',
      voiceId: voiceData.voiceId,
      isCustom: true,
      hasVoice: true
    }
    
    console.log('[SUCCESS] Updated persona with same ID:', updatedPersona.id)
    console.log('[SUCCESS] Voice ID assigned:', updatedPersona.voiceId)
    
    // Update personas array by ID match
    const updatedPersonas = allPersonas.map(persona => 
      persona.id === personaId ? updatedPersona : persona
    )
    
    // Update states
    setSelectedPersona(updatedPersona)
    setAllPersonas(updatedPersonas)
    
    // Add a new empty custom persona slot only if none exists
    addEmptyCustomPersona()
  }

  const addEmptyCustomPersona = () => {
    // Only add if there isn't already an empty custom persona
    const hasEmptyCustom = allPersonas.some(p => p.name === 'Custom Persona' && !p.voiceId)
    if (hasEmptyCustom) return
    
    const newPersona = {
      id: `custom-${Date.now()}`,
      name: 'Custom Persona',
      role: 'Add Your Voice',
      color: '#666666',
      avatar: null,
      voiceId: null,
      isCustom: true,
      hasVoice: false
    }
    
    setAllPersonas(prev => [...prev, newPersona])
  }

  const addCustomPersona = () => {
    // Find existing empty custom persona or create one
    const emptyCustomIndex = allPersonas.findIndex(p => p.name === 'Custom Persona' && !p.voiceId)
    
    if (emptyCustomIndex !== -1) {
      setActiveIndex(emptyCustomIndex)
      setSelectedPersona(allPersonas[emptyCustomIndex])
      setIsVoiceLabOpen(true)
    } else {
      addEmptyCustomPersona()
      setTimeout(() => {
        const newIndex = allPersonas.length
        setActiveIndex(newIndex)
        setSelectedPersona(allPersonas[newIndex])
        setIsVoiceLabOpen(true)
      }, 100)
    }
  }

  if (!user) {
    return <Auth onAuthSuccess={setUser} />
  }

  return (
    <div className="flex h-screen text-[#DCE6F1]">
      {/* Top Nav Bar */}
      <header className="fixed top-0 left-0 right-0 h-[66px] z-50 flex items-center px-[4%]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0))' }}>
        <div className="w-[30%] flex items-center gap-2">
          <div className="flex flex-col">
            <h1 className="text-[18px] font-semibold text-primary">IVY</h1>
            <div className="h-[1px] w-8 bg-[#45D6FF]" />
            <p className="text-[11px] text-secondary">Interview Virtual You</p>
          </div>
        </div>
        <div className="w-[40%] flex justify-center">
          <div className="px-6 py-2 rounded-full border border-transparent hover:border-[rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-[rgba(69,214,255,0.05)]" style={{ opacity: 0.9 }}>
            <span className="text-base font-semibold text-primary" style={{ fontSize: '120%', letterSpacing: '0.5px' }}>Dashboard Test</span>
          </div>
        </div>
        <div className="w-[30%] flex justify-end">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="w-9 h-9 rounded-lg hover:bg-[rgba(255,255,255,0.05)] flex items-center justify-center transition-all icon-inactive hover:opacity-100"
            >
              <History size={18} />
            </button>
            <div className="relative group">
              <button className="flex items-center gap-3 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] transition-all">
                <div className="w-7 h-7 rounded-full bg-[#5E6BFF] flex items-center justify-center text-xs font-semibold" style={{ filter: 'saturate(0.7)' }}>
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-metadata">User</span>
                <ChevronDown size={14} className="icon-inactive" />
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-40 rounded-xl bg-[rgba(11,16,24,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                <div className="p-2">
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setUser(null)
                    }}
                    className="w-full px-4 py-2.5 rounded-lg text-left text-sm hover:bg-[rgba(255,120,120,0.08)] transition-all flex items-center gap-3"
                    style={{ color: 'rgba(255,120,120,0.8)' }}
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex pt-[66px] px-[3%] py-6 gap-8 overflow-hidden">
        {/* Left Panel - Persona Carousel */}
        <div className="w-[58%] flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-primary mb-1">Choose Your Interviewer</h2>
            <p className="text-[10px] text-description">Swipe to explore personas</p>
          </div>

          {/* Persona Carousel */}
          <div className="relative h-[350px] flex items-center justify-center overflow-hidden">
            <div className="relative w-full flex items-center justify-center">
              {allPersonas.map((persona, index) => {
                const diff = (index - activeIndex + allPersonas.length) % allPersonas.length
                const isActive = diff === 0
                const isPrev = diff === allPersonas.length - 1
                const isNext = diff === 1
                
                let position = 0
                if (isActive) position = 0
                else if (isPrev) position = -1
                else if (isNext) position = 1
                else position = 2

                return (
                  <div
                    key={`${persona.name}-${index}`}
                    onClick={() => {
                      setActiveIndex(index)
                      setSelectedPersona(persona)
                    }}
                    className="absolute cursor-pointer transition-all duration-500 ease-out group"
                    style={{
                      opacity: isActive ? 1 : 0.5,
                      transform: `translateX(${position * 300}px) scale(${isActive ? 1 : 0.85})`,
                      filter: isActive ? 'none' : 'blur(0.5px)',
                      zIndex: isActive ? 10 : 5,
                      pointerEvents: Math.abs(position) > 1 ? 'none' : 'auto',
                      visibility: Math.abs(position) > 1 ? 'hidden' : 'visible'
                    }}
                  >
                    <div 
                      className="w-[240px] h-[300px] rounded-2xl bg-[rgba(255,255,255,0.02)] p-5 flex flex-col items-center justify-center transition-all duration-500 relative"
                      style={{
                        boxShadow: isActive ? `0 20px 40px rgba(0,0,0,0.7), inset 0 0 0 1px ${persona.color}60` : 'none'
                      }}
                    >
                      <div 
                        className="w-24 h-24 rounded-full mb-5 flex items-center justify-center text-2xl transition-all duration-500 overflow-hidden relative"
                        style={{
                          background: persona.color,
                          boxShadow: isActive ? `0 0 25px ${persona.color}50` : 'none'
                        }}
                      >
                        {persona.avatar ? (
                          <img 
                            src={persona.avatar} 
                            alt={persona.name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">{persona.name?.[0]}</span>
                        )}
                        
                      {/* Custom voice indicator */}
                      {persona.hasVoice && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      </div>
                      <h3 className="text-lg font-semibold text-primary mb-1.5">{persona.name}</h3>
                      <p className="text-[10px] uppercase tracking-wider text-secondary">{persona.role}</p>
                      
                      {/* Delete button for custom personas with voices */}
                      {persona.isCustom && persona.hasVoice && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const updatedPersonas = allPersonas.filter((_, i) => i !== index)
                            setAllPersonas(updatedPersonas)
                            if (selectedPersona.name === persona.name) {
                              setActiveIndex(0)
                              setSelectedPersona(updatedPersonas[0])
                            }
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-all opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {/* Add Custom Persona Button */}
              <div
                onClick={addCustomPersona}
                className="absolute cursor-pointer transition-all duration-500 ease-out"
                style={{
                  opacity: 0.3,
                  transform: `translateX(${(allPersonas.length - activeIndex) * 300}px) scale(0.85)`,
                  zIndex: 5,
                  pointerEvents: 'auto'
                }}
              >
                <div className="w-[240px] h-[300px] rounded-2xl bg-[rgba(255,255,255,0.02)] border-2 border-dashed border-[rgba(255,255,255,0.1)] p-5 flex flex-col items-center justify-center transition-all duration-500 hover:border-[#45D6FF] hover:opacity-60">
                  <div className="w-24 h-24 rounded-full mb-5 flex items-center justify-center text-4xl transition-all duration-500 border-2 border-dashed border-[rgba(255,255,255,0.2)]">
                    <span className="text-[#45D6FF] font-bold text-3xl">+</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#45D6FF] mb-1.5">Add Custom</h3>
                  <p className="text-[10px] uppercase tracking-wider text-secondary">Create Persona</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Active Persona */}
        <div className="w-[42%] rounded-[28px] p-4 flex items-center justify-center min-h-0" style={{ background: 'radial-gradient(120% 120% at 50% 30%, rgba(79, 209, 255, 0.08), rgba(8, 12, 18, 1) 70%)' }}>
          <div className="w-full h-full max-h-[600px] overflow-hidden">
            <InterviewStage 
              selectedPersona={selectedPersona}
              onStartSpeaking={handleStartSpeaking}
              isLive={isLive}
              onOpenVoiceLab={() => setIsVoiceLabOpen(true)}
              onNewConversation={handleNewConversation}
            />
          </div>
        </div>
      </main>

      <VoiceLab 
        isOpen={isVoiceLabOpen}
        onClose={() => setIsVoiceLabOpen(false)}
        onVoiceCloned={handleVoiceCloned}
        selectedPersona={selectedPersona}
      />

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        onRenameConversation={handleRenameConversation}
      />
    </div>
  )
}
