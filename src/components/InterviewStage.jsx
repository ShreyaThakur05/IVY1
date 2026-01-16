'use client'
import { User, Volume2, Mic, Video, Play } from 'lucide-react'
import { useState } from 'react'

export default function InterviewStage({ selectedPersona, onStartSpeaking, isLive, voices = [], onVoiceSelect, onOpenVoiceLab }) {
  const [selectedVoice, setSelectedVoice] = useState(null)

  const handleVoiceClick = (voice) => {
    setSelectedVoice(voice)
    if (onVoiceSelect) onVoiceSelect(voice)
  }

  const getPersonaGradient = () => {
    switch(selectedPersona?.color) {
      case 'indigo': return 'from-indigo-600 to-purple-600'
      case 'emerald': return 'from-emerald-600 to-teal-600'
      case 'rose': return 'from-rose-600 to-pink-600'
      default: return 'from-violet-600 to-indigo-600'
    }
  }

  // Position voices in an arch from left to center
  const getVoicePosition = (index, total) => {
    const angle = (index / (total + 1)) * 90 - 45 // -45 to 45 degrees
    const radius = 280
    const x = Math.sin((angle * Math.PI) / 180) * radius
    const y = -Math.cos((angle * Math.PI) / 180) * radius + radius
    return { x, y }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-between px-16">
      {/* Left Side - Voice Circles in Arch */}
      <div className="relative w-1/2 h-[600px]">
        {voices.map((voice, index) => {
          const pos = getVoicePosition(index, voices.length)
          return (
            <div
              key={voice.id}
              onClick={() => handleVoiceClick(voice)}
              className={`absolute cursor-pointer transition-all duration-300 hover:scale-110 ${
                selectedVoice?.id === voice.id ? 'scale-110' : ''
              }`}
              style={{
                left: `${pos.x + 200}px`,
                top: `${pos.y + 100}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${
                selectedVoice?.id === voice.id 
                  ? getPersonaGradient() 
                  : 'from-slate-800 to-slate-700'
              } flex items-center justify-center ring-4 ${
                selectedVoice?.id === voice.id 
                  ? 'ring-violet-500/30' 
                  : 'ring-slate-700/30'
              } shadow-xl hover:shadow-2xl`}>
                <User size={32} className="text-white" />
              </div>
              <p className="text-center text-sm font-bold text-white mt-2">{voice.name}</p>
            </div>
          )
        })}

        {/* Add Voice Button */}
        <div
          onClick={onOpenVoiceLab}
          className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
          style={{
            left: '200px',
            top: '400px',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-24 h-24 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-600 flex items-center justify-center hover:border-violet-500 transition-all">
            <Plus size={32} className="text-slate-500" />
          </div>
          <p className="text-center text-xs font-medium text-slate-500 mt-2">Add Voice</p>
        </div>
      </div>

      {/* Right Side - Animated Avatar */}
      <div className="relative w-1/2 flex flex-col items-center">
        {/* Avatar Container with Animation */}
        <div className="relative group">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${getPersonaGradient()} opacity-20 blur-3xl ${isLive ? 'animate-pulse' : ''}`} />
          
          <div className={`relative w-80 h-80 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700/50 flex flex-col items-center justify-center gap-6 shadow-2xl ${
            isLive ? 'animate-bounce-slow' : ''
          }`}>
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getPersonaGradient()} flex items-center justify-center ring-8 ring-slate-800/50 shadow-xl ${
              isLive ? 'animate-pulse' : ''
            }`}>
              <User size={64} className="text-white" />
            </div>
            
            <div className="text-center px-6">
              <h3 className="text-2xl font-black text-white mb-1">{selectedPersona?.name || 'Select Persona'}</h3>
              <p className="text-sm text-slate-400 font-medium">{selectedPersona?.role}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-xs text-slate-500 font-mono">{isLive ? 'LISTENING' : 'READY'}</span>
              </div>
            </div>

            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30">
              <div className="flex items-center gap-2">
                <Video size={12} className="text-violet-400" />
                <span className="text-[10px] font-bold text-violet-400 uppercase">AI Avatar Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Below Avatar */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <button 
              onClick={onOpenVoiceLab}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm transition-all flex items-center gap-2"
            >
              <Mic size={16} />
              Voice Lab
            </button>
            
            <button 
              onClick={onStartSpeaking}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-xl flex items-center gap-2 ${
                isLive 
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white' 
                  : `bg-gradient-to-r ${getPersonaGradient()} hover:opacity-90 text-white`
              }`}
            >
              {isLive ? (
                <>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  End Session
                </>
              ) : (
                <>
                  <Play size={16} />
                  Go Live
                </>
              )}
            </button>
          </div>

          <button className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 text-xs font-medium transition-all flex items-center gap-2">
            <Volume2 size={14} />
            Audio Settings
          </button>
        </div>

        {/* Selected Voice Info */}
        {selectedVoice && (
          <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 max-w-sm">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Selected Voice</p>
            <p className="text-white font-bold">{selectedVoice.name}</p>
            {selectedVoice.description && (
              <p className="text-sm text-slate-400 mt-1">{selectedVoice.description}</p>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function Plus({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}
