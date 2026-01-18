'use client'
import { User, ChevronDown } from 'lucide-react'

export default function TopNav({ user, activeTab = 'Dashboard', onTabChange }) {
  const tabs = ['Dashboard', 'Sessions', 'Cloud Voices', 'Settings']

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass-strong z-50 border-b border-white/10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/assets/logo.png" 
            alt="IVY Logo" 
            className="w-10 h-10 object-contain mix-blend-screen"
          />
          <span className="text-white font-bold text-lg">Interview Lab</span>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/40 rounded-xl p-1">
          {tabs.map((tab) => (
            tab === 'Dashboard' ? (
              <div key={tab} className="px-6 py-2 text-2xl font-black text-white relative select-none">
                {tab}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
              </div>
            ) : (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  activeTab === tab
                    ? 'text-white bg-slate-800/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
                )}
              </button>
            )
          ))}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 cursor-pointer transition-all group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-white">{user?.email?.split('@')[0] || 'User'}</span>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-white transition-colors" />
        </div>
      </div>
    </nav>
  )
}
