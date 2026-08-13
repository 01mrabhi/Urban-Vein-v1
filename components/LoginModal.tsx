'use client';
import React, { useState } from 'react';
import { EyeOff, Eye, Mail, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, getURL } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showToast } = useToast();
  const router = useRouter();

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
      onClose();
      router.refresh();
    } catch (error: any) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const redirectUrl = `${getURL()}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      showToast(error.message || 'Google login failed', 'error');
      setGoogleLoading(false);
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('hasSeenLoginPopup', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10"
          >
            {/* Close/Skip Button */}
            <button 
              onClick={handleSkip}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-900 rounded-full"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <div className="inline-block bg-red-600/10 text-red-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-3 border border-red-900/30">
                  Instant Verification
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight italic">Welcome to <span className="text-red-600">UrbanVein</span></h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2 italic">1-Click Sign-In for Fast & Secure Checkout</p>
              </div>

              {/* PRIMARY 1-CLICK GOOGLE LOGIN BUTTON */}
              <div className="space-y-4 mb-8">
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleLogin}
                  className="w-full bg-white hover:bg-zinc-100 text-black py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.15)] group"
                >
                  {googleLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                      Redirecting to Google...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#ea4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.409 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                        <path fill="#34a853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.076 7.076 0 01-6.725-4.962L1.248 17.24C3.206 21.2 7.273 23.909 12 23.909c3.1 0 5.733-1.013 7.707-2.726l-3.667-3.17z"/>
                        <path fill="#4a90e2" d="M19.707 21.183A11.977 11.977 0 0024 12.045c0-.825-.072-1.636-.206-2.436H12v4.814h6.814a5.833 5.833 0 01-2.505 3.864l3.398 2.896z"/>
                        <path fill="#fbbc05" d="M5.275 14.128A7.051 7.051 0 014.909 12c0-.745.122-1.464.335-2.145L1.24 6.74C.456 8.355 0 10.128 0 12c0 1.873.456 3.645 1.24 5.26l4.035-3.132z"/>
                      </svg>
                      <span>Continue with Google</span>
                      <span className="ml-auto text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Fast</span>
                    </>
                  )}
                </button>
              </div>

              {/* DIVIDER */}
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-900"></div>
                </div>
                <div className="relative bg-zinc-950 px-4 text-[9px] font-black tracking-widest uppercase text-zinc-600">
                  Or Sign In with Email
                </div>
              </div>

              {/* EMAIL & PASSWORD FORM */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input 
                      required
                      type="email" 
                      placeholder="NAME@DOMAIN.COM" 
                      className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl text-xs focus:outline-none focus:border-red-600 transition-all placeholder:text-zinc-700 font-bold uppercase tracking-widest"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input 
                      required
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl text-xs focus:outline-none focus:border-red-600 transition-all placeholder:text-zinc-700 font-bold tracking-widest"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  <div className="text-right pt-1">
                    <button 
                      type="button"
                      onClick={() => { onClose(); router.push('/forgot-password'); }} 
                      className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-black tracking-[0.2em] uppercase text-xs py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] active:scale-[0.98]"
                  >
                    {loading ? 'Authenticating...' : 'Sign In with Password'}
                  </button>
                </div>
              </form>

              <div className="mt-8 flex flex-col items-center gap-4 text-center">
                <button 
                  onClick={handleSkip}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                >
                  Skip for now
                </button>

                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  New to UrbanVein? <button onClick={() => { onClose(); router.push('/register'); }} className="text-red-500 hover:text-red-400 font-bold">Register Account</button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

