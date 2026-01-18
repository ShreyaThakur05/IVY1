'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut, ChevronDown } from 'lucide-react'

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
      console.log('Attempting auth with:', { email, isSignUp })
      
      if (isSignUp) {
        console.log('Signing up...')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        })
        console.log('Sign up result:', { data, error })
        if (error) throw error
        if (data.user) {
          console.log('Sign up successful, user:', data.user)
          onAuthSuccess(data.user)
        }
      } else {
        console.log('Signing in...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        console.log('Sign in result:', { data, error })
        if (error) throw error
        if (data.user) {
          console.log('Sign in successful, user:', data.user)
          onAuthSuccess(data.user)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert(`Authentication failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider) => {
    try {
      console.log('Attempting OAuth login with:', provider)
      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: window.location.origin
        }
      })
      console.log('OAuth result:', { data, error })
      if (error) throw error
    } catch (error) {
      console.error('OAuth error:', error)
      alert(`OAuth login failed: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`rounded-3xl shadow-2xl relative overflow-hidden w-full max-w-3xl h-[520px] transition-all duration-700 bg-[#0B1018] border border-[rgba(255,255,255,0.05)] ${isSignUp ? 'active' : ''}`}>
        
        {/* Sign In Form */}
        <div className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-600 ease-in-out ${isSignUp ? 'z-[2] translate-x-full opacity-0 pointer-events-none' : 'z-[2] translate-x-0 opacity-100 pointer-events-auto'}`}>
          <form onSubmit={handleAuth} className="flex flex-col items-center justify-center h-full px-10">
            <h1 className="text-3xl font-semibold text-primary mb-2">Sign In</h1>
            <p className="text-sm text-secondary mb-6">Welcome back to IVY</p>
            
            <div className="flex gap-3 mb-4">
              <button type="button" onClick={() => handleOAuthLogin('google')} className="w-10 h-10 rounded-full border border-[#45D6FF]/30 hover:border-[#45D6FF] hover:bg-[#45D6FF]/10 transition-all flex items-center justify-center">
                <i className="fab fa-google text-[#45D6FF]"></i>
              </button>
              <button type="button" onClick={() => handleOAuthLogin('github')} className="w-10 h-10 rounded-full border border-[#5E6BFF]/30 hover:border-[#5E6BFF] hover:bg-[#5E6BFF]/10 transition-all flex items-center justify-center">
                <i className="fab fa-github text-[#5E6BFF]"></i>
              </button>
            </div>

            <span className="text-[11px] text-description mb-4">or use your email</span>
            
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#EAF1F7] mb-3 focus:outline-none focus:border-[#45D6FF] focus:shadow-[0_0_12px_rgba(69,214,255,0.15)] transition-all text-sm"
              required
            />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#EAF1F7] mb-3 focus:outline-none focus:border-[#45D6FF] focus:shadow-[0_0_12px_rgba(69,214,255,0.15)] transition-all text-sm"
              required
            />
            
            <a href="#" className="text-[#45D6FF] text-xs mb-4 hover:text-[#5E6BFF] transition-all text-description">Forgot Password?</a>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-[14px] font-semibold uppercase tracking-wider transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(69,214,255,0.3)] text-sm mb-3"
              style={{ background: 'linear-gradient(135deg, #45D6FF, #5E6BFF)', color: '#EAF1F7' }}
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
            
            {/* Temporary bypass for development */}
            <button 
              type="button"
              onClick={() => {
                console.log('Using dev bypass authentication');
                onAuthSuccess({ id: 'dev-user', email: 'dev@test.com' });
              }}
              className="w-full py-2 rounded-[14px] font-medium text-xs border border-[#45D6FF]/30 text-[#45D6FF] hover:bg-[#45D6FF]/10 transition-all"
            >
              Skip Auth (Dev)
            </button>
          </form>
        </div>

        {/* Sign Up Form */}
        <div className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-600 ease-in-out ${isSignUp ? 'z-[5] translate-x-full opacity-100 pointer-events-auto' : 'z-[1] translate-x-0 opacity-0 pointer-events-none'}`}>
          <form onSubmit={handleAuth} className="flex flex-col items-center justify-center h-full px-10">
            <h1 className="text-3xl font-semibold text-primary mb-2">Create Account</h1>
            <p className="text-sm text-secondary mb-6">Start your journey with IVY</p>
            
            <div className="flex gap-3 mb-4">
              <button type="button" onClick={() => handleOAuthLogin('google')} className="w-10 h-10 rounded-full border border-[#45D6FF]/30 hover:border-[#45D6FF] hover:bg-[#45D6FF]/10 transition-all flex items-center justify-center">
                <i className="fab fa-google text-[#45D6FF]"></i>
              </button>
              <button type="button" onClick={() => handleOAuthLogin('github')} className="w-10 h-10 rounded-full border border-[#5E6BFF]/30 hover:border-[#5E6BFF] hover:bg-[#5E6BFF]/10 transition-all flex items-center justify-center">
                <i className="fab fa-github text-[#5E6BFF]"></i>
              </button>
            </div>

            <span className="text-[11px] text-description mb-4">or use your email</span>
            
            <input 
              type="text" 
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#EAF1F7] mb-3 focus:outline-none focus:border-[#45D6FF] focus:shadow-[0_0_12px_rgba(69,214,255,0.15)] transition-all text-sm"
              required
            />
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#EAF1F7] mb-3 focus:outline-none focus:border-[#45D6FF] focus:shadow-[0_0_12px_rgba(69,214,255,0.15)] transition-all text-sm"
              required
            />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#EAF1F7] mb-4 focus:outline-none focus:border-[#45D6FF] focus:shadow-[0_0_12px_rgba(69,214,255,0.15)] transition-all text-sm"
              required
            />
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[14px] font-semibold uppercase tracking-wider transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(69,214,255,0.3)] text-sm"
              style={{ background: 'linear-gradient(135deg, #45D6FF, #5E6BFF)', color: '#EAF1F7' }}
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-600 ease-in-out z-[1000] ${isSignUp ? '-translate-x-full rounded-r-[150px]' : 'translate-x-0 rounded-l-[150px]'}`}>
          <div className={`h-full w-[200%] relative left-[-100%] transition-all duration-600 ease-in-out ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`} style={{ background: 'radial-gradient(120% 120% at 50% 30%, rgba(94,107,255,0.25), rgba(69,214,255,0.12), rgba(0,0,0,1) 70%)' }}>
            
            {/* Floating gradient blobs */}
            <div className="absolute top-[20%] left-[30%] w-64 h-64 rounded-full bg-[#5E6BFF]/20 blur-[80px] animate-float" />
            <div className="absolute bottom-[30%] right-[20%] w-48 h-48 rounded-full bg-[#45D6FF]/15 blur-[60px] animate-float-delayed" />
            
            {/* Toggle Left Panel */}
            <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center px-8 text-center transition-all duration-600 ease-in-out ${isSignUp ? 'translate-x-0' : '-translate-x-[200%]'}`}>
              <div className="mb-4 text-6xl" style={{ filter: 'drop-shadow(0 0 20px rgba(69,214,255,0.3))' }}>👤</div>
              <h1 className="text-3xl font-semibold text-primary mb-3">Welcome Back!</h1>
              <p className="text-secondary mb-6 leading-relaxed text-sm">Enter your details to access all features</p>
              <button 
                type="button"
                onClick={() => setIsSignUp(false)}
                className="border-2 border-[#45D6FF] text-[#45D6FF] px-10 py-2.5 rounded-xl font-semibold uppercase tracking-wider hover:bg-[#45D6FF] hover:text-[#05070C] transition-all text-sm"
              >
                Sign In
              </button>
            </div>

            {/* Toggle Right Panel */}
            <div className={`absolute right-0 w-1/2 h-full flex flex-col items-center justify-center px-8 text-center transition-all duration-600 ease-in-out ${isSignUp ? 'translate-x-[200%]' : 'translate-x-0'}`}>
              <div className="mb-4 text-6xl" style={{ filter: 'drop-shadow(0 0 20px rgba(69,214,255,0.3))' }}>🚀</div>
              <div className="h-[2px] w-20 mb-4" style={{ background: 'linear-gradient(90deg, transparent, #45D6FF, transparent)' }} />
              <h1 className="text-3xl font-semibold text-primary mb-3">Hello, Friend!</h1>
              <p className="text-secondary mb-6 leading-relaxed text-sm">Register to start your interview practice journey</p>
              <button 
                type="button"
                onClick={() => setIsSignUp(true)}
                className="border-2 border-[#45D6FF] text-[#45D6FF] px-10 py-2.5 rounded-xl font-semibold uppercase tracking-wider hover:bg-[#45D6FF] hover:text-[#05070C] transition-all text-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 15px); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; z-index: 1; }
          50% { opacity: 0; z-index: 5; }
          100% { opacity: 1; z-index: 5; }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
