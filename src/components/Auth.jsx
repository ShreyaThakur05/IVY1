'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Auth({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        })
        if (error) throw error
        if (data.user) onAuthSuccess(data.user)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        if (data.user) onAuthSuccess(data.user)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) alert(error.message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className={`glass rounded-3xl shadow-2xl relative overflow-hidden w-full max-w-4xl min-h-[500px] transition-all duration-700 ${isSignUp ? 'active' : ''}`}>
        
        {/* Sign In Form */}
        <div className={`absolute top-0 h-full w-1/2 transition-all duration-700 z-20 ${isSignUp ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
          <form onSubmit={handleAuth} className="flex flex-col items-center justify-center h-full px-12">
            <h1 className="text-3xl font-black text-white mb-6">Sign In</h1>
            
            <div className="flex gap-3 mb-6">
              <button type="button" onClick={() => handleOAuthLogin('google')} className="w-10 h-10 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center">
                <i className="fab fa-google text-white"></i>
              </button>
              <button type="button" onClick={() => handleOAuthLogin('github')} className="w-10 h-10 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center">
                <i className="fab fa-github text-white"></i>
              </button>
            </div>

            <span className="text-slate-400 text-sm mb-4">or use your email</span>
            
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white mb-3 focus:outline-none focus:border-indigo-500"
              required
            />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white mb-3 focus:outline-none focus:border-indigo-500"
              required
            />
            
            <a href="#" className="text-slate-400 text-sm mb-4 hover:text-white">Forgot Password?</a>
            
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white px-12 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Sign Up Form */}
        <div className={`absolute top-0 h-full w-1/2 transition-all duration-700 z-20 ${isSignUp ? 'translate-x-full opacity-100' : 'translate-x-0 opacity-0 pointer-events-none'}`}>
          <form onSubmit={handleAuth} className="flex flex-col items-center justify-center h-full px-12">
            <h1 className="text-3xl font-black text-white mb-6">Create Account</h1>
            
            <div className="flex gap-3 mb-6">
              <button type="button" onClick={() => handleOAuthLogin('google')} className="w-10 h-10 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center">
                <i className="fab fa-google text-white"></i>
              </button>
              <button type="button" onClick={() => handleOAuthLogin('github')} className="w-10 h-10 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center">
                <i className="fab fa-github text-white"></i>
              </button>
            </div>

            <span className="text-slate-400 text-sm mb-4">or use your email</span>
            
            <input 
              type="text" 
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white mb-3 focus:outline-none focus:border-indigo-500"
              required
            />
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white mb-3 focus:outline-none focus:border-indigo-500"
              required
            />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white mb-6 focus:outline-none focus:border-indigo-500"
              required
            />
            
            <button 
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-12 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Toggle Panel */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 z-10 ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 h-full w-[200%] relative left-[-100%] transition-all duration-700 ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`}>
            
            {/* Left Panel */}
            <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center px-8 text-center transition-all duration-700 ${isSignUp ? 'translate-x-0' : '-translate-x-[200%]'}`}>
              <h1 className="text-3xl font-black text-white mb-4">Welcome Back!</h1>
              <p className="text-white/90 mb-6">Enter your details to access all features</p>
              <button 
                onClick={() => setIsSignUp(false)}
                className="border-2 border-white text-white px-12 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white hover:text-indigo-600 transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Right Panel */}
            <div className={`absolute right-0 w-1/2 h-full flex flex-col items-center justify-center px-8 text-center transition-all duration-700 ${isSignUp ? 'translate-x-[200%]' : 'translate-x-0'}`}>
              <h1 className="text-3xl font-black text-white mb-4">Hello, Friend!</h1>
              <p className="text-white/90 mb-6">Register to start your interview practice journey</p>
              <button 
                onClick={() => setIsSignUp(true)}
                className="border-2 border-white text-white px-12 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white hover:text-indigo-600 transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
