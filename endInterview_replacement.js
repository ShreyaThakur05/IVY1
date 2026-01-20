  const endInterview = async () => {
    if (!sessionIdRef.current && !localStorage.getItem('ivy_session_id')) {
      alert('No active interview to end')
      return
    }
    
    // Terminate interview immediately
    setIsInterviewActive(false)
    
    // Stop all current audio first
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
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
    
    // Show thank you and start analysis immediately
    setShowThankYou(true)
    setIsAnalyzing(true)
    
    try {
      const currentSessionId = sessionIdRef.current || localStorage.getItem('ivy_session_id')
      const response = await fetch(`${API_BASE_URL}/api/interview/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSessionId })
      })
      
      if (response.ok) {
        const analysis = await response.json()
        console.log('📊 Interview Analysis:', analysis)
        setAnalysisResult(analysis)
        
        // Pass analysis to parent immediately
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
        
      } else {
        throw new Error('Analysis failed')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Failed to analyze interview')
    } finally {
      setIsAnalyzing(false)
    }
  }