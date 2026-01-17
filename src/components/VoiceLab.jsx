'use client'
import { useState, useRef, useEffect } from 'react'
import { Mic, Upload, Plus, X, Volume2, CheckCircle2, AlertCircle } from 'lucide-react'
import { getGenericAvatar } from '@/lib/personas'

export default function VoiceLab({ isOpen, onClose, onVoiceCloned }) {
  const [cloningStatus, setCloningStatus] = useState('idle')
  const [recordTime, setRecordTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [error, setError] = useState('')
  const [gender, setGender] = useState('')
  const [voiceName, setVoiceName] = useState('')
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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioBlob(file)
      setCloningStatus('processing')
      setTimeout(() => {
        setCloningStatus('success')
        if (onVoiceCloned) onVoiceCloned()
      }, 2500)
    }
  }

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
      <div className="bg-[#0B1018] w-full max-w-3xl rounded-[28px] border border-[rgba(255,255,255,0.05)] shadow-2xl">
        <div className="p-8 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-[#DCE6F1]">Voice Lab</h2>
            <p className="text-[#5C6678] text-sm mt-1">Clone your voice for personalized interviews</p>
          </div>
          <button onClick={onClose} className="text-[#5C6678] hover:text-[#DCE6F1] p-2 hover:bg-[#0A0F17] rounded-lg transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-[#0A0F17] border border-[rgba(255,255,255,0.05)] rounded-xl flex items-center gap-3 text-[#45D6FF]">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Voice Name and Gender */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Voice Name"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#EAF1F7] focus:outline-none focus:border-[#45D6FF] transition-all text-sm"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#EAF1F7] focus:outline-none focus:border-[#45D6FF] transition-all text-sm appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="" style={{ backgroundColor: '#0B1018', color: '#5C6678' }}>Select Gender</option>
              <option value="male" style={{ backgroundColor: '#0B1018', color: '#EAF1F7' }}>Male</option>
              <option value="female" style={{ backgroundColor: '#0B1018', color: '#EAF1F7' }}>Female</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={`p-8 rounded-2xl border transition-all ${
              cloningStatus === 'recording' ? 'border-[#45D6FF] glow-cyan' : 'border-[rgba(255,255,255,0.05)] hover:border-[#45D6FF]'
            }`}>
              <Mic className={cloningStatus === 'recording' ? 'text-[#45D6FF] animate-pulse mb-4' : 'text-[#5E6BFF] mb-4'} size={36} />
              <h3 className="text-lg font-semibold text-[#DCE6F1] mb-2">Clone Me</h3>
              <p className="text-sm text-[#5C6678] mb-6">Record exactly 60 seconds</p>
              
              {cloningStatus === 'idle' && (
                <button onClick={startRecording} className="w-full py-4 rounded-xl bg-[#5E6BFF] hover:bg-[#45D6FF] text-[#DCE6F1] font-semibold transition-all">
                  Start Recording
                </button>
              )}

              {cloningStatus === 'recording' && (
                <div className="space-y-4">
                  <div className="h-2 bg-[#0A0F17] rounded-full overflow-hidden">
                    <div className="h-full bg-[#45D6FF] transition-all" style={{ width: `${(recordTime / 60) * 100}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#45D6FF] font-mono font-medium">{Math.floor(recordTime / 60)}:{(recordTime % 60).toString().padStart(2, '0')} / 1:00</span>
                    <button onClick={cancelRecording} className="text-sm font-medium text-[#DCE6F1] bg-[#0A0F17] px-4 py-2 rounded-lg">Cancel</button>
                  </div>
                </div>
              )}

              {cloningStatus === 'processing' && (
                <div className="flex items-center gap-3 text-[#5E6BFF] animate-pulse font-medium">
                  <Volume2 className="animate-bounce" size={20} />
                  Analyzing voice...
                </div>
              )}

              {cloningStatus === 'success' && (
                <div className="flex items-center gap-3 text-[#3CFF9E] font-medium">
                  <CheckCircle2 size={20} />
                  Voice cloned!
                </div>
              )}
            </div>

            <div className="p-8 rounded-2xl border border-[rgba(255,255,255,0.05)] hover:border-[#3CFF9E] transition-all">
              <Upload className="mb-4 text-[#3CFF9E]" size={36} />
              <h3 className="text-lg font-semibold text-[#DCE6F1] mb-2">Upload Audio</h3>
              <p className="text-sm text-[#5C6678] mb-6">Upload 60s recording</p>
              <label className="w-full py-4 rounded-xl bg-[#0A0F17] hover:bg-[#0B1018] text-[#DCE6F1] font-medium flex items-center justify-center gap-2 cursor-pointer transition-all">
                <Plus size={18} />
                Choose File
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Clone Button */}
          <div className="mt-6">
            <button
              onClick={async () => {
                if (!voiceName.trim() || !gender) {
                  setError('Please enter voice name and select gender')
                  return
                }
                if (!audioBlob) {
                  setError('Please record or upload audio first')
                  return
                }
                
                setCloningStatus('processing')
                try {
                  const formData = new FormData()
                  formData.append('user_id', 'current_user')
                  formData.append('voice_name', voiceName)
                  formData.append('audio_file', audioBlob)
                  
                  const response = await fetch('http://localhost:8002/api/voice/clone', {
                    method: 'POST',
                    body: formData
                  })
                  
                  if (response.ok) {
                    const result = await response.json()
                    setCloningStatus('success')
                    if (onVoiceCloned) {
                      onVoiceCloned({
                        name: voiceName,
                        gender,
                        avatar: getGenericAvatar(gender),
                        voiceId: result.voice_id
                      })
                    }
                  } else {
                    throw new Error('Voice cloning failed')
                  }
                } catch (err) {
                  setError('Voice cloning failed. Please try again.')
                  setCloningStatus('idle')
                }
              }}
              disabled={!audioBlob || cloningStatus === 'processing'}
              className="w-full py-4 rounded-xl font-semibold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #45D6FF, #5E6BFF)', color: '#EAF1F7' }}
            >
              {cloningStatus === 'processing' ? 'Processing...' : 'Clone Voice'}
            </button>
          </div>

          {cloningStatus === 'recording' && (
            <div className="p-6 bg-[#0A0F17] rounded-2xl border border-[rgba(255,255,255,0.05)]">
              <p className="text-xs uppercase font-medium text-[#5C6678] mb-3">Sample Script</p>
              <p className="text-base text-[#8E9AAF] italic">
                "I am practicing for my upcoming interviews using IVY. This technology will help me improve my speech patterns and boost my confidence."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
