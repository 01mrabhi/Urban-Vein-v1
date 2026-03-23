'use client';
import React from 'react';
import Navbar from '../../components/Navbar';
import { 
  CreditCard, 
  Lock, 
  ChevronRight, 
  Info, 
  Apple, 
  Wallet,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { motion } from 'motion/react';

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Payment Details */}
          <div className="lg:col-span-7 space-y-12">
            <header>
              <div className="flex items-center gap-3 text-zinc-500 mb-4">
                <Lock size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Secure Checkout</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-4">Secure Payment</h1>
              <p className="text-red-500 font-bold uppercase tracking-[0.2em] text-xs">Complete your digital identity</p>
            </header>

            {/* Express Checkout */}
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Express Checkout</h2>
              <div className="grid grid-cols-3 gap-4">
                <button className="h-16 rounded-2xl bg-zinc-900/50 border border-zinc-900 flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-800 transition-all">
                  <Apple size={24} />
                </button>
                <button className="h-16 rounded-2xl bg-zinc-900/50 border border-zinc-900 flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-800 transition-all">
                  <Wallet size={24} className="text-blue-500" />
                </button>
                <button className="h-16 rounded-2xl bg-zinc-900/50 border border-zinc-900 flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-800 transition-all">
                  <span className="font-black italic text-sm">PayPal</span>
                </button>
              </div>
            </section>

            <div className="relative py-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-900"></div></div>
              <span className="relative bg-zinc-950 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">or pay with card</span>
            </div>

            {/* Card Form */}
            <form className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />
                    <CreditCard size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM / YY"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center justify-between">
                      CVV / CVC
                      <Info size={12} className="text-zinc-700 hover:text-red-500 cursor-help" />
                    </label>
                    <input 
                      type="password" 
                      placeholder="***"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="save-card" className="w-5 h-5 accent-red-600 rounded-md bg-zinc-900 border-zinc-800" />
                <label htmlFor="save-card" className="text-xs text-zinc-500 font-bold tracking-tight">Securely save my card for future purchases</label>
              </div>

              <button className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:scale-[1.02] active:scale-95 transition-all group">
                Complete Purchase <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
              
              <div className="flex items-center justify-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 size={12} className="text-green-600" />
                Encrypted & Secure 256-bit SSL Connection
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900/20 border border-zinc-900 p-8 lg:p-12 rounded-[3.5rem] sticky top-8"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight mb-10 italic">Order Summary</h2>
              
              {/* Product Preview */}
              <div className="flex items-center gap-8 mb-10 p-6 rounded-3xl bg-zinc-950/50 border border-zinc-900">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200&auto=format&fit=crop" alt="Cyber Hoodie" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest mb-1">Cyber-Vein Custom Hoodie</h3>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-2">Limited Edition • Jet Black</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Size: XL / Design: Custom Logo</p>
                </div>
              </div>

              {/* Price Table */}
              <div className="space-y-6 mb-10 pt-6 border-t border-zinc-900">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">$78.00</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <span>Digital Customization</span>
                  <span className="text-white">$12.00</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <span>Shipping (Global Express)</span>
                  <span className="text-white">$5.00</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                   <span>Estimated Taxes</span>
                   <span className="text-white">$6.40</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-end justify-between mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-2">Total Amount</span>
                <span className="text-5xl lg:text-6xl font-black tracking-tighter text-red-600">$101.40</span>
              </div>

              {/* Promo Code */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="PROMO CODE"
                  className="w-full bg-zinc-950/50 border border-zinc-900 rounded-2xl px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] focus:outline-none focus:border-red-600 transition-colors pr-24"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors">
                  Apply
                </button>
              </div>
            </motion.section>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-10">
             <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Returns Policy</a>
             <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Shipping Info</a>
             <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Contact Support</a>
          </div>
          <div className="flex items-center gap-6 text-zinc-600 grayscale opacity-40">
             <CreditCard size={24} />
             <Apple size={24} />
             <Wallet size={24} />
          </div>
        </div>
        <div className="text-center mt-12 text-[8px] font-bold text-zinc-700 uppercase tracking-[0.5em]">
          © 2024 URBANVEIN INDUSTRIES. BUILT FOR THE MODERN NOMAD.
        </div>
      </footer>
    </main>
  );
}
