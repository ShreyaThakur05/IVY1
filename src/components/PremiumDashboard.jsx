'use client'
import { Mic, Upload, User, Play, Square, Volume2, Sparkles } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function PremiumDashboard({ 
  voices = [], 
  onVoiceSelect, 
  onOpenVoiceLab,
  onStartRecording,
  onUploadVoice,
  isLive,
  onToggleLive,
  selectedVoice,
  user
}) {
  const [hoveredVoice, setHoveredVoice] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let interval
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            handleStopRecording()
            return 0
          }
          return prev + 1
        })
        setAudioLevel(Math.random() * 100)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const handleStartRecording = async () => {
    setIsRecording(true)
    if (onStartRecording) await onStartRecording()
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setRecordingTime(0)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && onUploadVoice) {
      onUploadVoice(file)
    }
  }

  // Position voices in large semi-circular arc
  const getVoicePosition = (index, total) => {
    const startAngle = -60
    const endAngle = 60
    const angle = startAngle + (index / (total - 1 || 1)) * (endAngle - startAngle)
    const radius = 220
    const x = Math.sin((angle * Math.PI) / 180) * radius
    const y = -Math.cos((angle * Math.PI) / 180) * radius + radius * 0.8
    return { x, y, angle }
  }

  return (
    <div className="flex h-full">
      {/* LEFT PANEL - 60% - Voice Architecture & Controls */}
      <div className="w-[60%] p-12 flex flex-col">
        {/* Section Title */}
        <div className="mb-16">
          <h1 className="text-8xl font-black mb-6 leading-none select-none">
            <span className="relative inline-block">
              <span className="absolute inset-0 text-slate-700 transform translate-x-2 translate-y-2 blur-sm">
                Persona
              </span>
              <span className="absolute inset-0 text-slate-600 transform translate-x-1 translate-y-1">
                Persona
              </span>
              <span className="relative text-white text-3d">
                Persona
              </span>
            </span>
            <br />
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-b from-indigo-700 to-cyan-700 bg-clip-text text-transparent transform translate-x-2 translate-y-2 blur-sm">
                Architecture
              </span>
              <span className="absolute inset-0 bg-gradient-to-b from-indigo-600 to-cyan-600 bg-clip-text text-transparent transform translate-x-1 translate-y-1">
                Architecture
              </span>
              <span className="relative bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent text-3d-gradient">
                Architecture
              </span>
            </span>
          </h1>
          <p className="text-slate-400 text-lg ml-4 font-medium">
            Customize interview voice, tone, and cognitive profile
          </p>
        </div>

        {/* Voice Arc Container */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-[500px]">
              {/* Voice Nodes */}
              {voices.map((voice, index) => {
                const pos = getVoicePosition(index, voices.length)
                const isSelected = selectedVoice?.id === voice.id
                const isHovered = hoveredVoice === voice.id

                return (
                  <div
                    key={voice.id}
                    onClick={() => onVoiceSelect?.(voice)}
                    onMouseEnter={() => setHoveredVoice(voice.id)}
                    onMouseLeave={() => setHoveredVoice(null)}
                    className="absolute cursor-pointer transition-all duration-500 animate-float"
                    style={{
                      left: `calc(50% + ${pos.x}px)`,
                      top: `${pos.y + 100}px`,
                      transform: 'translate(-50%, -50%)',
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    {/* Outer Glow Ring */}
                    {(isSelected || isHovered) && (
                      <div className="absolute inset-0 rounded-full animate-pulse-ring">
                        <div className={`w-full h-full rounded-full ${
                          isSelected ? 'bg-indigo-500/30' : 'bg-cyan-500/20'
                        }`} />
                      </div>
                    )}

                    {/* Waveform Ring */}
                    <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                      isSelected || isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full animate-waveform"
                          style={{
                            left: `${50 + Math.cos((i / 8) * Math.PI * 2) * 50}%`,
                            top: `${50 + Math.sin((i / 8) * Math.PI * 2) * 50}%`,
                            height: '20px',
                            transform: 'translate(-50%, -50%)',
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>

                    {/* Voice Circle */}
                    <div className={`relative w-28 h-28 rounded-full glass-strong flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? 'ring-4 ring-indigo-500/50 neon-glow scale-110' 
                        : isHovered 
                        ? 'ring-2 ring-cyan-500/30 scale-105' 
                        : 'ring-1 ring-white/10'
                    }`}>
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                        isSelected 
                          ? 'from-indigo-500 to-purple-600' 
                          : 'from-slate-700 to-slate-800'
                      } flex items-center justify-center animate-breathe`}>
                        <User size={28} className="text-white" />
                      </div>
                    </div>

                    {/* Voice Label */}
                    <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 text-center transition-all duration-300 ${
                      isHovered || isSelected ? 'opacity-100' : 'opacity-70'
                    }`}>
                      <p className="text-white font-bold text-sm whitespace-nowrap">{voice.name}</p>
                      {(isHovered || isSelected) && voice.description && (
                        <p className="text-slate-400 text-xs mt-1 whitespace-nowrap">{voice.description}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Controls - Add Voice */}
        <div className="flex items-center gap-4 mt-8">
          {/* Record Voice Button */}
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isRecording && recordingTime < 60}
            className={`flex-1 px-6 py-4 rounded-2xl glass font-bold text-sm transition-all flex items-center justify-center gap-3 group ${
              isRecording 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : 'hover:bg-slate-800/60 hover:scale-[1.02] text-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isRecording 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:scale-110 transition-transform'
            }`}>
              <Mic size={20} className="text-white" />
            </div>
            <div className="text-left">
              <div className="font-black">{isRecording ? 'Recording...' : 'Record My Voice'}</div>
              {isRecording && (
                <div className="text-xs opacity-70">{recordingTime}s / 60s</div>
              )}
            </div>
            {isRecording && (
              <div className="flex gap-1 ml-auto">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-400 rounded-full animate-waveform"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </button>

          {/* Upload Voice Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-6 py-4 rounded-2xl glass font-bold text-sm transition-all flex items-center justify-center gap-3 hover:bg-slate-800/60 hover:scale-[1.02] text-white group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={20} className="text-white" />
            </div>
            <div className="text-left">
              <div className="font-black">Add Voice</div>
              <div className="text-xs text-slate-400">Upload audio file</div>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* RIGHT PANEL - 40% - AI Avatar */}
      <div className="w-[40%] p-12 flex flex-col items-center justify-center relative">
        {/* Background Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-96 h-96 rounded-full bg-gradient-to-r ${
            isLive 
              ? 'from-red-500/20 to-pink-500/20 animate-pulse' 
              : 'from-indigo-500/10 to-purple-500/10'
          } blur-3xl`} />
        </div>

        {/* Avatar Container */}
        <div className="relative z-10">
          {/* Audio Halo */}
          {isLive && (
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full rounded-full border-2 border-indigo-500/30 animate-pulse-ring"
                  style={{ animationDelay: `${i * 0.7}s` }}
                />
              ))}
            </div>
          )}

          {/* Main Avatar */}
          <div className={`relative w-80 h-80 rounded-full glass-strong flex items-center justify-center transition-all duration-500 ${
            isLive ? 'neon-glow scale-105' : ''
          }`}>
            {/* Inner Avatar Circle */}
            <div className={`w-56 h-56 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center relative ${
              isLive ? 'animate-breathe' : ''
            }`}>
              <User size={80} className="text-white" />
              
              {/* Sparkle Badge */}
              <div className="absolute -top-2 -right-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center gap-1.5 shadow-xl">
                <Sparkles size={12} className="text-white" />
                <span className="text-[10px] font-black text-white uppercase">AI Avatar</span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-strong flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
              }`} />
              <span className="text-xs font-mono font-bold text-white">
                {isLive ? 'LIVE' : 'READY'}
              </span>
            </div>
          </div>

          {/* Selected Voice Info */}
          {selectedVoice && (
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Active Persona</p>
              <p className="text-white font-black text-xl">{selectedVoice.name}</p>
              {selectedVoice.description && (
                <p className="text-slate-400 text-sm mt-1">{selectedVoice.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="mt-12 flex flex-col gap-4 w-full max-w-sm z-10">
          {/* Primary Action Button */}
          <button
            onClick={onToggleLive}
            disabled={!selectedVoice}
            className={`w-full px-8 py-5 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 ${
              isLive
                ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white neon-glow scale-105'
                : selectedVoice
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:scale-105 neon-glow'
                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLive ? (
              <>
                <Square size={20} className="fill-current" />
                END LIVE INTERVIEW
              </>
            ) : (
              <>
                <Play size={20} className="fill-current" />
                INITIATE LIVE INTERVIEW
              </>
            )}
          </button>

          {/* Secondary Button */}
          <button
            onClick={onOpenVoiceLab}
            className="w-full px-8 py-4 rounded-2xl glass font-bold text-sm transition-all flex items-center justify-center gap-3 hover:bg-slate-800/60 hover:scale-[1.02] text-white neon-glow-cyan"
          >
            <Volume2 size={18} />
            ENTER VOICE LAB
          </button>

          {/* Equalizer Bars */}
          {isLive && (
            <div className="flex items-end justify-center gap-1 h-12 mt-4">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full animate-waveform"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
