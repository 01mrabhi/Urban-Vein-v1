import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, User, Search, Menu, Lock, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const isCheckout = pathname === '/checkout';
  const { cartCount, openSidebar } = useCart();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex flex-wrap items-center justify-between px-5 md:px-8 py-4 md:py-6 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80">
      
      {/* 1. Logo */}
      <div className="flex items-center gap-1 order-1">
        <Link href="/" className="flex items-center">
          <img 
            src="/products/Urban Vein logo.png" 
            alt="UrbanVein Logo" 
            className="h-7 md:h-8 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          />
        </Link>
      </div>

      {!isCheckout ? (
        <>
          {/* 2. Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-8 order-2 mx-8">
            <Link href="/#shop" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">Shop</Link>
            <Link href="/customizer" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${pathname === '/customizer' ? 'text-red-600' : 'text-zinc-400 hover:text-white'}`}>Customizer</Link>
            <Link href="/lookbook" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">Lookbook</Link>
            <Link href="/help" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${pathname === '/help' ? 'text-red-600' : 'text-zinc-400 hover:text-white'}`}>Support</Link>
          </div>

          {/* 3. Search Bar (Flipkart Style) */}
          <div className="w-full lg:w-auto flex-1 order-last lg:order-3 relative mt-4 lg:mt-0 max-w-none lg:max-w-md xl:max-w-xl" ref={searchRef}>
            <div className={`flex items-center bg-[#111111] hover:bg-[#151515] border ${isSearchFocused ? 'border-red-600' : 'border-zinc-800'} rounded-xl px-4 py-2.5 transition-colors group`}>
              <Search size={18} className={`mr-3 transition-colors ${isSearchFocused ? 'text-red-600' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
              <input 
                type="text" 
                placeholder="Search for products, brands and more" 
                className="bg-transparent border-none outline-none text-white text-sm font-medium tracking-wide w-full placeholder:text-zinc-500"
                onFocus={() => setIsSearchFocused(true)}
              />
            </div>
            
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 ml-2">Popular Discoveries</p>
                  <div className="flex flex-col gap-1">
                     <div className="text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer px-3 py-2.5 hover:bg-zinc-800/80 rounded-lg transition-colors flex items-center gap-3"><Search size={14} className="text-zinc-500"/> Heavyweight Hoodies</div>
                     <div className="text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer px-3 py-2.5 hover:bg-zinc-800/80 rounded-lg transition-colors flex items-center gap-3"><Search size={14} className="text-zinc-500"/> Graphic Tees</div>
                     <div className="text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer px-3 py-2.5 hover:bg-zinc-800/80 rounded-lg transition-colors flex items-center gap-3"><Search size={14} className="text-zinc-500"/> V.001 Drop</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Icons */}
          <div className="flex items-center gap-4 md:gap-6 order-3 lg:order-4 lg:ml-8">
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
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-zinc-400 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col pt-24 px-8 pb-12 overflow-y-auto"
              >
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-8 right-8 text-zinc-500 hover:text-white p-2 rounded-full border border-zinc-800 hover:bg-zinc-900 transition-all"
                >
                  <X size={24} />
                </button>
                
                <nav className="flex flex-col gap-6 flex-1 mt-10">
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/#shop" className="text-4xl xs:text-5xl font-black uppercase tracking-tighter text-white hover:text-red-600 transition-colors italic">Shop</Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/customizer" className="text-4xl xs:text-5xl font-black uppercase tracking-tighter text-white hover:text-red-600 transition-colors italic">Customizer</Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/lookbook" className="text-4xl xs:text-5xl font-black uppercase tracking-tighter text-white hover:text-red-600 transition-colors italic">Lookbook</Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/profile" className="text-4xl xs:text-5xl font-black uppercase tracking-tighter text-white hover:text-red-600 transition-colors italic">Profile</Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/help" className="text-4xl xs:text-5xl font-black uppercase tracking-tighter text-white hover:text-red-600 transition-colors italic">Support</Link>
                </nav>
                
                <div className="mt-12 flex flex-col gap-4 border-t border-zinc-900 pt-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">UrbanVein System v2.0</p>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                    Architecting the future of street aesthetics. High-grade fabrics. Zero Compromise.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="flex items-center gap-3 text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800 order-2">
          <Lock size={14} className="text-red-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Checkout</span>
        </div>
      )}
    </nav>
  );
}
