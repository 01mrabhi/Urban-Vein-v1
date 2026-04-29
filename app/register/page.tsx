'use client';
import React, { useState } from 'react';
import { EyeOff, Eye, ShieldCheck, Mail, User, Phone } from 'lucide-react';
import Link from 'next/link';
import { supabase, getURL } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  
  const router = useRouter();
  const { showToast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${getURL()}/auth/callback`,
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) throw error;

      showToast('Registration successful! Please check your email for confirmation.', 'success');
      router.push('/');
    } catch (error: any) {
      showToast(error.message || 'Failed to register', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 sm:p-8 selection:bg-red-600/30">
      <div className="w-full max-w-[1200px] h-[850px] bg-[#0f0f0f] rounded-[2.5rem] overflow-hidden flex shadow-2xl shadow-black/50 border border-zinc-900">
        
        {/* Right Image Section (Flipped from login for variety) */}
        <div className="hidden lg:block w-1/2 relative bg-zinc-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-80"></div>
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-red-950/20 to-transparent z-10 pointer-events-none transform -skew-x-12 -translate-x-1/4"></div>
          
          <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop" 
            alt="Futuristic Model" 
            className="w-full h-full object-cover grayscale-[0.2] contrast-125"
          />

          <div className="absolute bottom-20 left-16 z-20 max-w-md">
            <span className="inline-block bg-[#ff1a1a] text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest mb-4">
              JOIN THE SYSTEM
            </span>
            <h2 className="text-5xl font-black text-white italic tracking-tighter leading-[1.1] mb-6">
              ARCHITECT YOUR <br/>
              <span className="text-[#ff1a1a]">AESTHETIC.</span>
            </h2>
            <p className="text-zinc-300 text-sm font-medium leading-relaxed pr-8">
              Unlock the vault. Get early access to limited technical drops and manage your personal style archive.
            </p>
          </div>
        </div>

        {/* Left Form Section */}
        <div className="w-full lg:w-1/2 p-12 sm:p-16 lg:p-24 flex flex-col justify-center relative bg-[#0f0f0f]">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <img 
              src="/products/Urban Vein logo.png" 
              alt="UrbanVein Logo" 
              className="h-8 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] grayscale brightness-200"
            />
            <span className="text-xl font-bold tracking-[0.2em] uppercase text-white">UrbanVein</span>
          </Link>

          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
          <p className="text-zinc-500 mb-10 font-medium">Join the next evolution of urban streetwear.</p>

          <form className="space-y-6" onSubmit={handleRegister}>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  required
                  type="text" 
                  placeholder="Alex Mercer" 
                  className="w-full bg-white text-black pl-12 pr-4 py-3.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow placeholder:text-zinc-400 font-medium"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  required
                  type="email" 
                  placeholder="name@domain.com" 
                  className="w-full bg-white text-black pl-12 pr-4 py-3.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow placeholder:text-zinc-400 font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full bg-white text-black pl-12 pr-4 py-3.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow placeholder:text-zinc-400 font-bold tracking-widest"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">Minimum 8 characters with numbers and symbols.</p>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-[#ff1a1a] hover:bg-red-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-black tracking-[0.2em] uppercase text-sm py-4 rounded-full mt-4 transition-all shadow-[0_0_20px_rgba(255,26,26,0.3)] hover:shadow-[0_0_30px_rgba(255,26,26,0.5)] active:scale-[0.98]"
            >
              {loading ? 'Processing...' : 'Initialize Account'}
            </button>
          </form>

          <div className="mt-12">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative bg-[#0f0f0f] px-4 text-[10px] font-black tracking-widest uppercase text-zinc-600">
                Or join with
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
                <svg className="w-5 h-5 fill-blue-500" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
          </div>

          <p className="text-center text-xs font-semibold text-zinc-500 mt-12">
            Already have an account? <Link href="/login" className="text-red-500 hover:text-red-400 font-bold">Sign In</Link>
          </p>

        </div>

      </div>
    </div>
  );
}
