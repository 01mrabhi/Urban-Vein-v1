'use client';
import React, { useState } from 'react';
import { EyeOff, Eye, Mail, Lock, X, Apple, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      showToast(error.message || 'Google login failed', 'error');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      showToast(error.message || 'Facebook login failed', 'error');
    }
  };

  const handleSkip = () => {
    // Set a flag in sessionStorage so it doesn't pop up again in this session
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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl z-10"
          >
            {/* Close/Skip Button */}
            <button 
              onClick={handleSkip}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-900 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="p-10 sm:p-12">
              <div className="text-center mb-10">
                <div className="inline-block bg-red-600/10 text-red-600 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest mb-4">
                  Identify Yourself
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight italic">Welcome to <span className="text-red-600">UrbanVein</span></h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2 italic">Access the digital frontier. Skip to explore anonymously.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
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
                  <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Access Key</label>
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
                </div>

                <div className="pt-2">
                  <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-black tracking-[0.2em] uppercase text-xs py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] active:scale-[0.98]"
                  >
                    {loading ? 'Decrypting...' : 'Initiate Access'}
                  </button>
                </div>
              </form>

              <div className="mt-10 flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-zinc-900 flex-1"></div>
                  <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Collective Auth</span>
                  <div className="h-px bg-zinc-900 flex-1"></div>
                </div>
                
                <div className="flex gap-4">
                  <button onClick={handleGoogleLogin} className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#ea4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.409 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                      <path fill="#34a853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.076 7.076 0 01-6.725-4.962L1.248 17.24C3.206 21.2 7.273 23.909 12 23.909c3.1 0 5.733-1.013 7.707-2.726l-3.667-3.17z"/>
                      <path fill="#4a90e2" d="M19.707 21.183A11.977 11.977 0 0024 12.045c0-.825-.072-1.636-.206-2.436H12v4.814h6.814a5.833 5.833 0 01-2.505 3.864l3.398 2.896z"/>
                      <path fill="#fbbc05" d="M5.275 14.128A7.051 7.051 0 014.909 12c0-.745.122-1.464.335-2.145L1.24 6.74C.456 8.355 0 10.128 0 12c0 1.873.456 3.645 1.24 5.26l4.035-3.132z"/>
                    </svg>
                  </button>
                  <button onClick={handleFacebookLogin} className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-all text-blue-500">
                    <Facebook size={20} className="fill-blue-500" />
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-all text-red-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                <button 
                  onClick={handleSkip}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                >
                  Skip for now
                </button>

                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  New here? <button onClick={() => { onClose(); router.push('/register'); }} className="text-red-600 hover:text-red-500">Register Identity</button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
