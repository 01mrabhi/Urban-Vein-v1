'use client';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { ArrowRight, Sparkles, Copy, Check, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import ProductSection from '../components/ProductSection';
import Footer from '../components/Footer';
import Lookbook from '../components/Lookbook';
import CouponPromoBanner from '../components/CouponPromoBanner';

export default function Home() {
  const [copiedHero, setCopiedHero] = useState(false);

  const handleCopyHeroCode = () => {
    navigator.clipboard.writeText('WELCOME100');
    setCopiedHero(true);
    setTimeout(() => setCopiedHero(false), 2500);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-red-600/30 pt-24 lg:pt-28">
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[88vh] text-center p-6 [perspective:1000px] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08)_0%,transparent_70%)] opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, rotateX: 20, y: 50 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 px-6 py-2 rounded-full mb-8 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400">System Ready // Genesis Drop Live</span>
          </motion.div>

          <h1 className="text-8xl md:text-[14rem] font-black tracking-tighter uppercase leading-[0.75] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-zinc-900 drop-shadow-[0_20px_50px_rgba(255,255,255,0.05)]">
            Urban<br />Vein
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 mb-8 max-w-xl font-bold uppercase tracking-[0.2em] italic leading-relaxed">
            Architecting the future of street aesthetics. High-grade fabrics. <span className="text-white">Zero Compromise.</span>
          </p>

          {/* Interactive Coupon Hero Pill */}
          <motion.button
            onClick={handleCopyHeroCode}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 bg-zinc-900/90 hover:bg-zinc-900 border border-red-500/40 hover:border-red-500/80 px-6 py-3 rounded-full mb-10 backdrop-blur-md transition-all shadow-[0_0_30px_rgba(220,38,38,0.18)] cursor-pointer group"
            title="Click to copy coupon code WELCOME100"
          >
            <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-300">
              <Sparkles size={13} className="text-red-500 animate-pulse" />
              Intro Offer: <span className="text-white font-black">Flat ₹100 OFF</span> with code
            </span>
            <span className="bg-red-600 text-white text-[10px] md:text-xs font-black tracking-widest px-3 py-1 rounded-full font-mono flex items-center gap-1.5 shadow-sm group-hover:bg-red-500 transition-colors">
              <Tag size={11} className="text-red-200" />
              WELCOME100
              {copiedHero ? (
                <span className="text-[9px] font-bold uppercase tracking-wider text-green-300 flex items-center gap-0.5">
                  <Check size={11} /> Copied!
                </span>
              ) : (
                <Copy size={11} className="opacity-70 group-hover:opacity-100" />
              )}
            </span>
          </motion.button>

          <motion.a
            href="#shop"
            whileHover={{ scale: 1.05, rotateX: 5, boxShadow: '0 20px 80px rgba(220,38,38,0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-6 bg-red-600 text-white px-16 py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-500 transition-all shadow-[0_20px_60px_rgba(220,38,38,0.3)] group"
          >
            Explore Collection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </motion.a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 opacity-20"
        >
          <span className="text-[7px] font-black uppercase tracking-[0.6em] vertical-text">Begin Exploration</span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-white via-white/50 to-transparent"></div>
        </motion.div>
      </section>

      {/* New Drops & Promo Marquee Carousel */}
      <div className="bg-red-600 py-3.5 overflow-hidden whitespace-nowrap border-y border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.25)] relative z-20">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
          className="flex gap-16 items-center"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-16 items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
                🔥 USE CODE &quot;WELCOME100&quot; FOR ₹100 OFF ON YOUR ORDER
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">&#47;&#47;</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                ⚡ FLAT ₹100 DISCOUNT ON ORDERS ABOVE ₹499
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">&#47;&#47;</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                JOIN THE COLLECTIVE FOR EARLY ACCESS
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">&#47;&#47;</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                FREE PAN-INDIA EXPRESS SHIPPING
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">&#47;&#47;</span>
            </div>
          ))}
        </motion.div>
      </div>

      <ProductSection />

      {/* Dedicated Coupon Promo Section */}
      <CouponPromoBanner />

      {/* High-Impact Lookbook */}
      <Lookbook />

      <Footer />
    </main>
  );
}
