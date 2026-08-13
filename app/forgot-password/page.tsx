'use client';
import React, { useState } from 'react';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase, getURL } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${getURL()}/auth/callback?next=/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setSubmitted(true);
      showToast('Password reset link sent to your email!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 sm:p-8 selection:bg-red-600/30">
      <div className="w-full max-w-[550px] bg-[#0f0f0f] rounded-[2.5rem] p-10 sm:p-14 shadow-2xl border border-zinc-900 text-center relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-red-600 rounded-full shadow-[0_0_20px_#dc2626]" />

        {/* Back Link */}
        <Link href="/login" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 border border-red-900/30">
            <ShieldCheck size={12} /> Security Recovery
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-3">Forgot Password?</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Enter your registered email address and we will send you a secure link to reset your access key.
          </p>
        </div>

        {submitted ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mx-auto">
              <Mail size={24} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Reset Link Dispatched</h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              We sent a password recovery link to <span className="text-white font-bold">{email}</span>. Please check your inbox and spam folder.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white pt-2 transition-colors"
            >
              Didn&apos;t receive email? Resend
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  required
                  type="email" 
                  placeholder="name@domain.com" 
                  className="w-full bg-white text-black pl-12 pr-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow placeholder:text-zinc-500 font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-[#ff1a1a] hover:bg-red-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-black tracking-[0.2em] uppercase text-xs py-4 rounded-full transition-all shadow-[0_0_20px_rgba(255,26,26,0.3)] hover:shadow-[0_0_30px_rgba(255,26,26,0.5)] active:scale-[0.98]"
            >
              {loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        <div className="mt-10 text-[10px] font-bold uppercase tracking-widest text-zinc-700">
          &copy; URBAN VEIN INDUSTRIES &bull; SECURE RECOVERY SYSTEM
        </div>
      </div>
    </div>
  );
}
