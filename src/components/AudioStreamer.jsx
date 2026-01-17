'use client'
import { useRef, useEffect, useState } from 'react'

export default function AudioStreamer({ onAudioData, isActive }) {
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    if (isActive && !isStreaming) {
      startStreaming()
    } else if (!isActive && isStreaming) {
      stopStreaming()
    }
  }, [isActive, isStreaming])

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      streamRef.current = stream
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && onAudioData) {
          onAudioData(event.data)
        }
      }

      mediaRecorderRef.current.start(100) // Send data every 100ms
      setIsStreaming(true)
    } catch (error) {
      console.error('Streaming failed:', error)
    }
  }

  const stopStreaming = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setIsStreaming(false)
  }

  useEffect(() => {
    return () => {
      stopStreaming()
    }
  }, [])

  return null // This is a utility component with no UI
}