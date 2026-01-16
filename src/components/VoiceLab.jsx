'use client'
import { useState, useRef, useEffect } from 'react'
import { Mic, Upload, Plus, X, Volume2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function VoiceLab({ isOpen, onClose, onVoiceCloned }) {
  const [cloningStatus, setCloningStatus] = useState('idle')
  const [recordTime, setRecordTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [error, setError] = useState('')
  const timerRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
        
        if (recordTime >= 60) {
          setCloningStatus('processing')
          setTimeout(() => {
            setCloningStatus('success')
            if (onVoiceCloned) onVoiceCloned()
          }, 2500)
        }
      }

      mediaRecorderRef.current.start()
      setCloningStatus('recording')
      setRecordTime(0)

      timerRef.current = setInterval(() => {
        setRecordTime(prev => {
          if (prev >= 60) {
            stopRecording()
            return 60
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      setError('Microphone access denied')
      console.error(err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    clearInterval(timerRef.current)
  }

  const cancelRecording = () => {
    stopRecording()
    setCloningStatus('idle')
    setRecordTime(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
      <div className="bg-[#0B0B0F] w-full max-w-3xl rounded-2xl border border-slate-800/50 shadow-2xl">
        <div className="p-8 border-b border-slate-800/50 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white">Voice Lab</h2>
            <p className="text-slate-400 text-sm mt-1">Clone your voice for personalized interviews</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800/50 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={`p-8 rounded-2xl border-2 transition-all ${
              cloningStatus === 'recording' ? 'border-red-500 bg-red-500/5' : 'border-slate-800 bg-slate-900/30 hover:border-violet-500/50'
            }`}>
              <Mic className={cloningStatus === 'recording' ? 'text-red-500 animate-pulse mb-4' : 'text-violet-500 mb-4'} size={36} />
              <h3 className="text-xl font-bold text-white mb-2">Clone Me</h3>
              <p className="text-sm text-slate-400 mb-6">Record exactly 60 seconds</p>
              
              {cloningStatus === 'idle' && (
                <button onClick={startRecording} className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold">
                  Start Recording
                </button>
              )}

              {cloningStatus === 'recording' && (
                <div className="space-y-4">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all" style={{ width: `${(recordTime / 60) * 100}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-500 font-mono font-bold">{Math.floor(recordTime / 60)}:{(recordTime % 60).toString().padStart(2, '0')} / 1:00</span>
                    <button onClick={cancelRecording} className="text-sm font-bold text-white bg-slate-700 px-4 py-2 rounded-lg">Cancel</button>
                  </div>
                </div>
              )}

              {cloningStatus === 'processing' && (
                <div className="flex items-center gap-3 text-violet-400 animate-pulse font-bold">
                  <Volume2 className="animate-bounce" size={20} />
                  Analyzing voice...
                </div>
              )}

              {cloningStatus === 'success' && (
                <div className="flex items-center gap-3 text-emerald-500 font-bold">
                  <CheckCircle2 size={20} />
                  Voice cloned!
                </div>
              )}
            </div>

            <div className="p-8 rounded-2xl border-2 border-slate-800 bg-slate-900/30 hover:border-emerald-500/50 transition-all">
              <Upload className="mb-4 text-emerald-500" size={36} />
              <h3 className="text-xl font-bold text-white mb-2">Upload Audio</h3>
              <p className="text-sm text-slate-400 mb-6">Upload 60s recording</p>
              <label className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer">
                <Plus size={18} />
                Choose File
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {cloningStatus === 'recording' && (
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <p className="text-xs uppercase font-black text-slate-600 mb-3">Sample Script</p>
              <p className="text-base text-slate-300 italic">
                "I am practicing for my upcoming interviews using IVY. This technology will help me improve my speech patterns and boost my confidence."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
