'use client'
import { Plus, MessageSquare, Settings, Cpu, Edit2, Check, X } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar({ sessions, activeSession, onSessionClick, onNewInterview, user, onRenameSession }) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const startEdit = (session) => {
    setEditingId(session.id)
    setEditTitle(session.title)
  }

  const saveEdit = (sessionId) => {
    if (onRenameSession) onRenameSession(sessionId, editTitle)
    setEditingId(null)
  }

  return (
    <aside className="w-80 bg-[#0B0B0F] border-r border-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Cpu className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">IVY</h1>
            <p className="text-xs text-slate-500">Interview Virtual You</p>
          </div>
        </div>

        <button 
          onClick={onNewInterview}
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
        >
          <Plus size={18} />
          New Interview
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest px-2 mb-3">Recent Sessions</p>
        {sessions.map((session) => (
          <div 
            key={session.id}
            className={`group relative rounded-xl transition-all ${
              activeSession === session.id 
                ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30' 
                : 'hover:bg-slate-800/30 border border-transparent'
            }`}
          >
            {editingId === session.id ? (
              <div className="flex items-center gap-2 p-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-violet-500"
                  autoFocus
                />
                <button onClick={() => saveEdit(session.id)} className="text-green-500 hover:text-green-400">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => onSessionClick(session.id)}
                className="flex items-center gap-3 p-3 cursor-pointer"
              >
                <MessageSquare size={16} className={activeSession === session.id ? 'text-violet-400' : 'text-slate-500'} />
                <span className={`text-sm font-medium flex-1 truncate ${
                  activeSession === session.id ? 'text-white' : 'text-slate-400'
                }`}>{session.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startEdit(session)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-violet-400 transition-opacity"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/30 cursor-pointer transition-all">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/20" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-violet-500/20">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-none truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs text-slate-500 mt-1">Active</p>
          </div>
          <Settings size={18} className="text-slate-500 hover:text-violet-400 transition-colors" />
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e1e24;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2d2d35;
        }
      `}</style>
    </aside>
  )
}
