'use client';
import React, { useState } from 'react';
import { Sparkles, Copy, Check, ArrowRight, Tag, Gift, Flame, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function CouponPromoBanner() {
  const [copied, setCopied] = useState(false);
  const couponCode = 'WELCOME100';

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-16 px-6 lg:px-8 bg-zinc-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-900/90 border border-red-600/30 rounded-[2.5rem] p-8 md:p-12 lg:p-16 overflow-hidden shadow-[0_0_60px_rgba(220,38,38,0.12)]"
        >
          {/* Subtle Cyber Grid Accent */}
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.04] pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/30 px-4 py-1.5 rounded-full">
                <Flame size={14} className="text-red-500 animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
                  Introductory Offer // Active Now
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                Unlock <span className="text-red-600 italic">₹100 OFF</span><br />
                Your First Order
              </h2>

              <p className="text-zinc-400 text-sm md:text-base font-bold uppercase tracking-wider leading-relaxed max-w-xl italic">
                Step into the future of streetwear aesthetics. Apply coupon code at checkout to enjoy a flat discount on our entire heavyweight collection.
              </p>

              {/* Offer highlights */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-zinc-900/60 border border-zinc-800 px-3.5 py-2 rounded-xl">
                  <Gift size={14} className="text-red-500" />
                  <span>Flat ₹100 Discount</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-zinc-900/60 border border-zinc-800 px-3.5 py-2 rounded-xl">
                  <ShieldCheck size={14} className="text-red-500" />
                  <span>Min. Order ₹499</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-zinc-900/60 border border-zinc-800 px-3.5 py-2 rounded-xl">
                  <Sparkles size={14} className="text-red-500" />
                  <span>Instant 1-Click Apply</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Coupon Ticket Card */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
              <div className="w-full max-w-md bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-dashed border-red-600/50 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl group hover:border-red-500 transition-all">
                {/* Perforated ticket circles */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-950 rounded-full border-r-2 border-dashed border-red-600/50"></div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-950 rounded-full border-l-2 border-dashed border-red-600/50"></div>

                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <Tag size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Official Promo Voucher</span>
                  </div>

                  <div className="py-2">
                    <span className="text-5xl md:text-6xl font-black tracking-tight text-white font-mono">
                      ₹100 <span className="text-red-600 text-2xl font-sans uppercase">OFF</span>
                    </span>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                      Applicable on all products
                    </p>
                  </div>

                  {/* Coupon Box */}
                  <div className="bg-zinc-950 border border-red-600/40 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-inner">
                    <div className="text-left pl-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">Promo Code</span>
                      <span className="text-lg md:text-xl font-black font-mono tracking-widest text-white">{couponCode}</span>
                    </div>

                    <button
                      onClick={handleCopy}
                      className={`px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        copied
                          ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={14} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy Code
                        </>
                      )}
                    </button>
                  </div>

                  <a
                    href="#shop"
                    className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group"
                  >
                    <span>Claim & Shop Collection</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-red-500" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
