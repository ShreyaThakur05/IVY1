'use client'
import { useEffect, useRef } from 'react'

export default function VoiceWaveform({ isActive, audioLevel = 0, color = '#45D6FF', isAISpeaking = false }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    let time = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      
      if (!isActive && !isAISpeaking) {
        // Static line when inactive
        ctx.strokeStyle = `${color}40`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
        ctx.stroke()
        return
      }

      // Dynamic waveform when active
      const amplitude = isAISpeaking ? 30 : Math.max(audioLevel * 0.8, 20)
      const frequency = isAISpeaking ? 0.03 : 0.02
      const waveColor = isAISpeaking ? '#3CFF9E' : color
      
      ctx.strokeStyle = waveColor
      ctx.lineWidth = isAISpeaking ? 4 : 3
      ctx.beginPath()
      
      for (let x = 0; x < width; x++) {
        const baseWave = Math.sin(x * frequency + time) * amplitude
        const secondaryWave = Math.sin(x * frequency * 2 + time * 1.5) * (amplitude * 0.3)
        const y = height / 2 + baseWave + secondaryWave
        
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      
      ctx.stroke()
      
      // Add glow effect
      ctx.shadowColor = waveColor
      ctx.shadowBlur = isAISpeaking ? 15 : 10
      ctx.stroke()
      
      time += isAISpeaking ? 0.15 : 0.1
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, audioLevel, color, isAISpeaking])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      className="rounded-lg bg-black/20"
      style={{ filter: 'drop-shadow(0 0 10px rgba(69, 214, 255, 0.3))' }}
    />
  )
}