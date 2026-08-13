'use client';
import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      showToast('Password updated successfully!', 'success');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      showToast(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 sm:p-8 selection:bg-red-600/30">
      <div className="w-full max-w-[550px] bg-[#0f0f0f] rounded-[2.5rem] p-10 sm:p-14 shadow-2xl border border-zinc-900 text-center relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-red-600 rounded-full shadow-[0_0_20px_#dc2626]" />

        {/* Header */}
        <div className="mb-10">
          <div className="inline-block bg-red-600/10 text-red-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 border border-red-900/30">
            Account Security
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-3">Set New Password</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Enter your new access key below to secure your Urban Vein profile.
          </p>
        </div>

        {success ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-600/20 text-green-500 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Password Updated!</h2>
            <p className="text-xs text-zinc-400 font-medium">
              Redirecting you to the sign-in page...
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full bg-white text-black pl-12 pr-12 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow placeholder:text-zinc-500 font-bold tracking-widest"
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

            <div className="space-y-2 text-left">
              <label className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full bg-white text-black pl-12 pr-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow placeholder:text-zinc-500 font-bold tracking-widest"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-[#ff1a1a] hover:bg-red-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-black tracking-[0.2em] uppercase text-xs py-4 rounded-full transition-all shadow-[0_0_20px_rgba(255,26,26,0.3)] hover:shadow-[0_0_30px_rgba(255,26,26,0.5)] active:scale-[0.98]"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
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
