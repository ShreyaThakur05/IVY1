'use client'
import { useState, useRef, useEffect } from 'react'
import { Mic, Upload, X, Volume2, CheckCircle2 } from 'lucide-react'

export default function VoiceLab({ isOpen, onClose, onVoiceCloned, selectedPersona }) {
  const [cloningStatus, setCloningStatus] = useState('idle')
  const [recordTime, setRecordTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        console.log('Recording stopped, blob size:', blob.size)
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
        setCloningStatus('success')
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
      console.error('Recording failed:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    clearInterval(timerRef.current)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('File selected:', file.name, file.size, file.type)
      setAudioBlob(file)
      setCloningStatus('success')
    }
  }

  const handleCloneVoice = async () => {
    if (!voiceName.trim() || !gender || !audioBlob || !selectedPersona) {
      alert('Please fill all fields and record/upload audio')
      return
    }
    
    try {
      setCloningStatus('processing')
      console.log('Starting voice clone for:', selectedPersona.name)
      console.log('Audio blob:', audioBlob.size, 'bytes, type:', audioBlob.type)
      
      const formData = new FormData()
      formData.append('user_id', 'current_user')
      formData.append('voice_name', voiceName)
      formData.append('persona_id', selectedPersona.id)
      
      // Use the blob directly - let backend handle the format
      formData.append('audio_file', audioBlob, 'recording.webm')
      
      const response = await fetch('http://localhost:3001/api/interview/clone-voice', {
        method: 'POST',
        body: formData
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('[SUCCESS] Voice cloned:', result)
      setCloningStatus('success')
      
      onVoiceCloned({
        voiceId: result.voice_id,
        voiceName: voiceName,
        gender: gender
      })
      
      setTimeout(() => {
        setVoiceName('')
        setGender('')
        setAudioBlob(null)
        setCloningStatus('idle')
        setRecordTime(0)
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('[ERROR] Voice cloning failed:', error)
      alert(`Voice cloning failed: ${error.message}`)
      setCloningStatus('idle')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
      <div className="bg-[#0B1018] w-full max-w-2xl rounded-[28px] border border-[rgba(255,255,255,0.05)] shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#DCE6F1]">Voice Lab - Clone Your Voice</h2>
            {selectedPersona && (
              <p className="text-sm text-[#5C6678] mt-1">Cloning voice for: {selectedPersona.name}</p>
            )}
          </div>
          <button onClick={onClose} className="text-[#5C6678] hover:text-[#DCE6F1] p-2 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

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
            className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#EAF1F7] focus:outline-none focus:border-[#45D6FF] transition-all text-sm"
          >
            <option value="" style={{ backgroundColor: '#0B1018', color: '#5C6678' }}>Select Gender</option>
            <option value="male" style={{ backgroundColor: '#0B1018', color: '#EAF1F7' }}>Male</option>
            <option value="female" style={{ backgroundColor: '#0B1018', color: '#EAF1F7' }}>Female</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Record Voice */}
          <div className={`p-6 rounded-2xl border transition-all ${
            cloningStatus === 'recording' ? 'border-[#45D6FF]' : 'border-[rgba(255,255,255,0.05)] hover:border-[#45D6FF]'
          }`}>
            <Mic className={cloningStatus === 'recording' ? 'text-[#45D6FF] animate-pulse mb-4' : 'text-[#5E6BFF] mb-4'} size={32} />
            <h3 className="text-lg font-semibold text-[#DCE6F1] mb-2">Record Voice</h3>
            <p className="text-sm text-[#5C6678] mb-4">Record at least 10 seconds</p>
            
            {cloningStatus === 'idle' && (
              <button onClick={startRecording} className="w-full py-3 rounded-xl bg-[#5E6BFF] hover:bg-[#45D6FF] text-[#DCE6F1] font-semibold transition-all">
                Start Recording
              </button>
            )}

            {cloningStatus === 'recording' && (
              <div className="space-y-3">
                <div className="h-2 bg-[#0A0F17] rounded-full overflow-hidden">
                  <div className="h-full bg-[#45D6FF] transition-all" style={{ width: `${(recordTime / 60) * 100}%` }} />
                </div>
                <div className="text-center">
                  <span className="text-[#45D6FF] font-mono font-medium">{recordTime}/60s</span>
                </div>
                <button onClick={stopRecording} className="w-full py-2 bg-[#0A0F17] text-[#DCE6F1] rounded-lg">Stop</button>
              </div>
            )}

            {cloningStatus === 'processing' && (
              <div className="flex items-center gap-3 text-[#5E6BFF] animate-pulse font-medium">
                <Volume2 className="animate-bounce" size={20} />
                Processing...
              </div>
            )}

            {cloningStatus === 'success' && (
              <div className="flex items-center gap-3 text-[#3CFF9E] font-medium">
                <CheckCircle2 size={20} />
                Ready to clone!
              </div>
            )}
          </div>

          {/* Upload Audio */}
          <div className="p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] hover:border-[#3CFF9E] transition-all">
            <Upload className="mb-4 text-[#3CFF9E]" size={32} />
            <h3 className="text-lg font-semibold text-[#DCE6F1] mb-2">Upload Audio</h3>
            <p className="text-sm text-[#5C6678] mb-4">Upload audio file (any format)</p>
            <label className="w-full py-3 rounded-xl bg-[#0A0F17] hover:bg-[#0B1018] text-[#DCE6F1] font-medium flex items-center justify-center gap-2 cursor-pointer transition-all">
              Choose File
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Clone Button */}
        <button
          onClick={handleCloneVoice}
          disabled={!voiceName.trim() || !gender || !audioBlob || !selectedPersona}
          className="w-full py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #45D6FF, #5E6BFF)', color: '#EAF1F7' }}
        >
          {selectedPersona ? `Clone Voice for ${selectedPersona.name}` : 'Select a Persona First'}
        </button>
      </div>
    </div>
  )
}
