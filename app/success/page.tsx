'use client';
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  ArrowRight, 
  Sparkles,
  Download,
  Calendar,
  Mail
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function SuccessPage() {
  const orderNumber = "UV-" + Math.random().toString(36).substring(2, 9).toUpperCase();

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-red-600/30 overflow-x-hidden">
      <Navbar />

      <div className="relative p-8 lg:p-24 flex flex-col items-center justify-center min-h-[80vh]">
        {/* Background Design */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] opacity-50"></div>
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-2xl bg-zinc-900/30 border border-zinc-900 p-12 lg:p-20 rounded-[4rem] backdrop-blur-3xl text-center space-y-12"
        >
          {/* Success Icon */}
          <div className="relative inline-block">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
               className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(220,38,38,0.4)]"
             >
                <CheckCircle2 size={48} className="text-white" />
             </motion.div>
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
               className="absolute inset-[-20px] border border-dashed border-red-600/30 rounded-full"
             ></motion.div>
          </div>

          <header className="space-y-6">
            <div className="flex items-center justify-center gap-4">
               <Sparkles size={16} className="text-red-600" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Order Confirmed</span>
               <Sparkles size={16} className="text-red-600" />
            </div>
            <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic">
              Welcome to the <span className="text-red-600">Collective</span>
            </h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed italic max-w-md mx-auto">
              Your transmission has been received. Your high-grade gear is now entering the assembly phase.
            </p>
          </header>

          {/* Order Details Card */}
          <div className="bg-zinc-950/50 border border-zinc-900 rounded-3xl p-8 space-y-6 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[40px] rounded-full pointer-events-none"></div>
            
            <div className="flex justify-between items-center pb-6 border-b border-zinc-900">
               <div className="space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 italic">Order Identification</p>
                 <p className="text-lg font-black tracking-tight text-white">{orderNumber}</p>
               </div>
               <button className="text-zinc-500 hover:text-white transition-colors">
                  <Download size={20} />
               </button>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-2">
               <div className="space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 italic"><Calendar size={10} className="inline mr-1" /> Estimated Dispatch</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">MARCH 15 - 18, 2024</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 italic"><Mail size={10} className="inline mr-1" /> Tracking Intel</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">SENT TO YOUR INBOX</p>
               </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Link 
               href="/help"
               className="flex items-center justify-center gap-3 bg-zinc-950 border border-zinc-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-900 transition-all group"
             >
               <Truck size={16} className="group-hover:translate-x-1 transition-transform" /> Track Journey
             </Link>
             <Link 
               href="/#shop"
               className="flex items-center justify-center gap-3 bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all shadow-xl shadow-red-600/20 group"
             >
               Explore More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>

          {/* Footer Note */}
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-700">
            For operational support, quote ref: <span className="text-zinc-500">{orderNumber}</span>
          </p>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
