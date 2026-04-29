'use client';
import React, { useState } from 'react';
import { EyeOff, Eye, Apple, Facebook, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { supabase, getURL } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showToast('Successfully logged in!', 'success');
      router.push('/');
    } catch (error: any) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 sm:p-8 selection:bg-red-600/30">
      <div className="w-full max-w-[1200px] h-[800px] bg-[#0f0f0f] rounded-[2.5rem] overflow-hidden flex shadow-2xl shadow-black/50 border border-zinc-900">
        
        {/* Left Form Section */}
        <div className="w-full lg:w-1/2 p-12 sm:p-16 lg:p-24 flex flex-col justify-center relative">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <img 
              src="/products/Urban Vein logo.png" 
              alt="UrbanVein Logo" 
              className="h-8 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] grayscale brightness-200"
            />
            <span className="text-xl font-bold tracking-[0.2em] uppercase text-white">UrbanVein</span>
          </Link>

          <h1 className="text-4xl font-bold text-white mb-10 tracking-tight">Welcome Back!</h1>

          <form className="space-y-6" onSubmit={handleLogin}>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  required
                  type="email" 
                  placeholder="name@domain.com" 
                  className="w-full bg-white text-black pl-12 pr-4 py-3.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow placeholder:text-zinc-500 font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full bg-white text-black pl-12 pr-4 py-3.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow placeholder:text-zinc-500 font-bold tracking-widest"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 border border-zinc-700 rounded bg-transparent group-hover:border-zinc-500 transition-colors">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="absolute inset-0 bg-red-600 scale-0 peer-checked:scale-100 transition-transform rounded-[3px] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember Me</span>
              </label>
              <a href="#" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">Forgot Your Password?</a>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-[#ff1a1a] hover:bg-red-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-black tracking-[0.2em] uppercase text-sm py-4 rounded-full mt-4 transition-all shadow-[0_0_20px_rgba(255,26,26,0.3)] hover:shadow-[0_0_30px_rgba(255,26,26,0.5)] active:scale-[0.98]"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-12">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative bg-[#0f0f0f] px-4 text-[10px] font-black tracking-widest uppercase text-zinc-600">
                Or login with
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: getURL() } });
                  if (error) showToast(error.message, 'error');
                }}
                className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-zinc-800 hover:scale-105 transition-all border border-zinc-800"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#ea4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.409 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                  <path fill="#34a853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.076 7.076 0 01-6.725-4.962L1.248 17.24C3.206 21.2 7.273 23.909 12 23.909c3.1 0 5.733-1.013 7.707-2.726l-3.667-3.17z"/>
                  <path fill="#4a90e2" d="M19.707 21.183A11.977 11.977 0 0024 12.045c0-.825-.072-1.636-.206-2.436H12v4.814h6.814a5.833 5.833 0 01-2.505 3.864l3.398 2.896z"/>
                  <path fill="#fbbc05" d="M5.275 14.128A7.051 7.051 0 014.909 12c0-.745.122-1.464.335-2.145L1.24 6.74C.456 8.355 0 10.128 0 12c0 1.873.456 3.645 1.24 5.26l4.035-3.132z"/>
                </svg>
              </button>
              <button 
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: getURL() } });
                  if (error) showToast(error.message, 'error');
                }}
                className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-zinc-800 hover:scale-105 transition-all text-blue-500 border border-zinc-800"
              >
                <Facebook size={20} className="fill-blue-500" />
              </button>
              <button 
                className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-zinc-800 hover:scale-105 transition-all text-red-600 border border-zinc-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-center text-xs font-semibold text-zinc-500 mt-12">
            Don't have an account? <Link href="/register" className="text-red-500 hover:text-red-400 font-bold">Sign Up</Link>
          </p>

        </div>

        {/* Right Image Section */}
        <div className="hidden lg:block w-1/2 relative bg-zinc-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-80"></div>
          {/* Faded overlay to match reference dark gradient */}
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-red-950/20 to-transparent z-10 pointer-events-none transform skew-x-12 translate-x-1/4"></div>
          
          <img 
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop" 
            alt="Futuristic Skyline" 
            className="w-full h-full object-cover grayscale-[0.2] contrast-125"
          />

          <div className="absolute bottom-20 left-16 z-20 max-w-md">
            <span className="inline-block bg-[#ff1a1a] text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest mb-4">
              NEWERA 2024
            </span>
            <h2 className="text-5xl font-black text-white italic tracking-tighter leading-[1.1] mb-6">
              PULSE OF THE <br/>
              <span className="text-[#ff1a1a]">UNDERGROUND.</span>
            </h2>
            <p className="text-zinc-300 text-sm font-medium leading-relaxed pr-8">
              Join the exclusive collective of urban pioneers. Access limited drops and futuristic style guides.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
