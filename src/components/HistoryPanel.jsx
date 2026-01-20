'use client'
import { useState } from 'react'
import { X, Edit2, Check, ArrowLeft } from 'lucide-react'

export default function HistoryPanel({ isOpen, onClose, conversations, activeConversation, onSelectConversation, onRenameConversation }) {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [viewingConversation, setViewingConversation] = useState(null)

  const startEdit = (conv) => {
    setEditingId(conv.id)
    setEditValue(conv.title)
  }

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onRenameConversation(editingId, editValue.trim())
    }
    setEditingId(null)
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    
    if (isToday) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[380px] z-50 transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(11, 16, 24, 0.85)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-2">
            {viewingConversation ? (
              <>
                <button 
                  onClick={() => setViewingConversation(null)}
                  className="flex items-center gap-2 text-[#45D6FF] hover:text-[#5E6BFF] transition-all"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm font-medium">Back</span>
                </button>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-[rgba(255,255,255,0.05)] flex items-center justify-center transition-all icon-inactive hover:opacity-100"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-primary">Conversation History</h2>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-[rgba(255,255,255,0.05)] flex items-center justify-center transition-all icon-inactive hover:opacity-100"
                >
                  <X size={18} />
                </button>
              </>
            )}
          </div>
          {!viewingConversation && <p className="text-[11px] text-description">Your interview memory layer</p>}
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-100px)] neural-scroll p-4">
          {viewingConversation ? (
            /* Individual Conversation View */
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-primary mb-1">{viewingConversation.title}</h3>
                <div className="flex items-center justify-center gap-3 text-xs text-metadata">
                  <span>{viewingConversation.persona}</span>
                  <span>•</span>
                  <span>{formatDate(viewingConversation.date)}</span>
                  {viewingConversation.analysis && (
                    <>
                      <span>•</span>
                      <span className="text-[#45D6FF]">Score: {viewingConversation.analysis.overall_score}/100</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                {viewingConversation.conversation?.map((msg, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className={`text-xs font-medium ${msg.role === 'user' ? 'text-[#45D6FF]' : 'text-green-400'}`}>
                      {msg.role === 'user' ? 'You' : viewingConversation.persona}
                    </div>
                    <div className="text-sm text-secondary bg-[rgba(255,255,255,0.02)] rounded-lg p-3">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation List */
            conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="text-4xl mb-4 opacity-20">💬</div>
                <p className="text-sm text-description">No conversations yet</p>
                <p className="text-xs text-metadata mt-2">Start your first interview to begin</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => {
                  const isActive = activeConversation === conv.id
                  const isEditing = editingId === conv.id

                  return (
                    <div
                      key={conv.id}
                      onClick={() => !isEditing && setViewingConversation(conv)}
                      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        isActive 
                          ? 'bg-[rgba(79,209,255,0.08)] border border-[rgba(79,209,255,0.25)]' 
                          : 'bg-[rgba(255,255,255,0.02)] border border-transparent hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)]'
                      }`}
                    >
                    {/* Title */}
                    {isEditing ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(79,209,255,0.4)] rounded-lg px-3 py-1.5 text-sm text-primary focus:outline-none focus:border-[rgba(79,209,255,0.6)]"
                          autoFocus
                        />
                        <button
                          onClick={saveEdit}
                          className="w-7 h-7 rounded-lg bg-[rgba(79,209,255,0.15)] hover:bg-[rgba(79,209,255,0.25)] flex items-center justify-center transition-all"
                        >
                          <Check size={14} className="text-[#45D6FF]" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-primary' : 'text-secondary'}`}>
                          {conv.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEdit(conv)
                          }}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-[rgba(255,255,255,0.08)] flex items-center justify-center transition-all"
                        >
                          <Edit2 size={12} className="icon-inactive" />
                        </button>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-[10px] text-metadata">
                      <span>{conv.persona}</span>
                      <span>•</span>
                      <span>{formatDate(conv.date)}</span>
                      {conv.messageCount && (
                        <>
                          <span>•</span>
                          <span>{conv.messageCount} msgs</span>
                        </>
                      )}
                      {conv.analysis && (
                        <>
                          <span>•</span>
                          <span className="text-[#45D6FF]">Score: {conv.analysis.overall_score}/100</span>
                        </>
                      )}
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#45D6FF] rounded-r-full" />
                    )}
                  </div>
                )})}
              </div>
            )
          )}
        </div>
      </div>
    </>
  )
}
