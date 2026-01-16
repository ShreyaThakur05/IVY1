'use client'
import { User } from 'lucide-react'

export default function PersonaCard({ name, role, description, color, active, onClick }) {
  const colorClasses = {
    indigo: active ? 'border-indigo-500 bg-indigo-500/10 shadow-xl shadow-indigo-500/20' : '',
    emerald: active ? 'border-emerald-500 bg-emerald-500/10 shadow-xl shadow-emerald-500/20' : '',
    rose: active ? 'border-rose-500 bg-rose-500/10 shadow-xl shadow-rose-500/20' : ''
  }

  const bgColors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500'
  }

  const textColors = {
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400'
  }

  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
        active ? colorClasses[color] : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
      }`}
    >
      <div className={`w-12 h-12 rounded-full mb-4 ${bgColors[color]} flex items-center justify-center text-white shadow-inner`}>
        <User size={24} />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textColors[color]}`}>{role}</p>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}
