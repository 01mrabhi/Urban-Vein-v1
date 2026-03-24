import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, User, Search, Menu, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const isCheckout = pathname === '/checkout';
  const { cartCount, openSidebar } = useCart();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer hover:border-zinc-600 transition-all p-0.5"
              >
                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" alt="User" />
                </div>
              </div>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/30">
                      <p className="text-sm font-bold text-white tracking-wide">Alex Mercer</p>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">alex@urbanvein.com</p>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <Link onClick={() => setIsProfileOpen(false)} href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all">
                        <User size={16} />
                        <span className="font-semibold tracking-wide">My Profile</span>
                      </Link>
                    </div>
                    <div className="p-2 border-t border-zinc-800/50">
                      <button onClick={() => setIsProfileOpen(false)} className="w-full flex items-center justify-between px-3 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                        <span className="font-bold tracking-wide">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
