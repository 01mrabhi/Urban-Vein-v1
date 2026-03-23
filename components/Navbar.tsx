import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Search, Menu, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const isCheckout = pathname === '/checkout';
  const { cartCount, openSidebar } = useCart();

  return (
    <nav className="flex items-center justify-between px-8 py-6 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80">
      <div className="flex items-center gap-1">
        <Link href="/" className="flex items-center">
          <img 
            src="/products/Urban Vein logo.png" 
            alt="UrbanVein Logo" 
            className="h-8 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          />
        </Link>
      </div>

      {!isCheckout ? (
        <>
          <div className="hidden md:flex items-center gap-10">
            <Link href="/#shop" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">Shop</Link>
            <Link href="/customizer" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${pathname === '/customizer' ? 'text-red-600' : 'text-zinc-400 hover:text-white'}`}>Customizer</Link>
            <Link href="/lookbook" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">Lookbook</Link>
            <Link href="/help" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${pathname === '/help' ? 'text-red-600' : 'text-zinc-400 hover:text-white'}`}>Support</Link>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <button onClick={openSidebar} className="relative text-zinc-400 hover:text-white transition-colors bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 group">
              <ShoppingBag size={18} />
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-zinc-950 px-1"
                  >
                    {cartCount}
                  </motion.span>
                )}
                {cartCount === 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border-2 border-zinc-950"></span>
                )}
              </AnimatePresence>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer hover:border-zinc-600 transition-all p-0.5">
              <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" alt="User" />
              </div>
            </div>
            <button className="md:hidden text-zinc-400 hover:text-white">
              <Menu size={20} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800">
          <Lock size={14} className="text-red-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Checkout</span>
        </div>
      )}
    </nav>
  );
}
