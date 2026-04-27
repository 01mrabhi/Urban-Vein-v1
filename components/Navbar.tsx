import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, User, Search, Menu, Lock, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const isCheckout = pathname === '/checkout';
  const { cartCount, openSidebar } = useCart();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial user check
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth event:", _event, "User:", session?.user?.id);
      setUser(session?.user ?? null);
    });

    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
  };

  const fullName = user?.user_metadata?.full_name || 'Urban Explorer';
  const email = user?.email || '';

  return (
    <nav className="flex items-center px-8 py-6 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80">
      {/* Left Section: Logo */}
      <div className="flex-1 flex items-center">
        <Link href="/" className="flex items-center">
          <img 
            src="/products/Urban Vein logo.png" 
            alt="UrbanVein Logo" 
            className="h-8 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          />
        </Link>
      </div>

      {/* Center Section: Navigation Links - Perfectly Centered */}
      {!isCheckout ? (
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-12">
          <Link href="/#shop" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-all hover:scale-110">Shop</Link>
          <Link href="/help" className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-110 ${pathname === '/help' ? 'text-red-600' : 'text-zinc-400 hover:text-white'}`}>Support</Link>
          <Link href="/lookbook" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-all hover:scale-110">Lookbook</Link>
        </div>
      ) : (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800">
          <Lock size={14} className="text-red-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Checkout</span>
        </div>
      )}

      {/* Right Section: Icons */}
      {!isCheckout ? (
        <div className="flex-1 flex items-center justify-end gap-4 lg:gap-6">
          <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">
            <Search size={20} />
          </button>
          <button onClick={openSidebar} className="relative w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors bg-zinc-900 rounded-xl border border-zinc-800 group">
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
            {user ? (
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer hover:border-zinc-600 transition-all p-0.5"
              >
                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${fullName}&backgroundColor=b91c1c&fontFamily=Arial&fontWeight=700`} 
                    alt="User" 
                  />
                </div>
              </div>
            ) : (
              <Link 
                href="/login"
                className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all border border-zinc-900 hover:border-zinc-800"
              >
                <User size={20} />
              </Link>
            )}

            <AnimatePresence>
              {isProfileOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/30">
                    <p className="text-sm font-bold text-white tracking-wide truncate">{fullName}</p>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5 truncate">{email}</p>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <Link onClick={() => setIsProfileOpen(false)} href="/#shop" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all">
                      <ShoppingBag size={16} className="text-red-500" />
                      <span className="font-semibold tracking-wide">Go to Shop</span>
                    </Link>
                    <Link onClick={() => setIsProfileOpen(false)} href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all">
                      <User size={16} />
                      <span className="font-semibold tracking-wide">My Profile</span>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-zinc-800/50">
                    <button onClick={handleSignOut} className="w-full flex items-center justify-between px-3 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                      <span className="font-bold tracking-wide">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">
            <Menu size={20} />
          </button>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Mobile Menu Modal */}
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
              {user && (
                <div className="mb-6 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Authenticated</p>
                  <p className="text-2xl font-black text-white truncate">{fullName}</p>
                  <p className="text-sm text-zinc-500 truncate">{email}</p>
                </div>
              )}
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/#shop" className="text-4xl xs:text-5xl font-black uppercase tracking-tighter text-white hover:text-red-600 transition-colors italic">Shop</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/help" className="text-4xl xs:text-5xl font-black uppercase tracking-tighter text-white hover:text-red-600 transition-colors italic">Support</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/lookbook" className="text-4xl xs:text-5xl font-black uppercase tracking-tighter text-white hover:text-red-600 transition-colors italic">Lookbook</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/profile" className="text-4xl xs:text-5xl font-black uppercase tracking-tighter text-white hover:text-red-600 transition-colors italic">Profile</Link>
              {user && (
                <button 
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="text-left text-4xl xs:text-5xl font-black uppercase tracking-tighter text-red-600 hover:text-white transition-colors italic"
                >
                  Sign Out
                </button>
              )}
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

      {/* New Modal Layer Search */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-md flex justify-center items-start pt-24 px-4"
            onClick={(e) => {
               if (e.target === e.currentTarget) setIsSearchOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="w-full max-w-2xl"
            >
              <div className="flex flex-col gap-2 relative z-50">
                <div className="flex items-center bg-[#111111] border border-red-600 rounded-2xl px-5 py-4 shadow-[0_0_40px_rgba(220,38,38,0.15)] group">
                  <Search size={22} className="mr-4 text-red-600" />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Search for products, brands and more" 
                    className="bg-transparent border-none outline-none text-white text-lg md:text-xl font-medium tracking-wide w-full placeholder:text-zinc-500"
                  />
                  <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors ml-3"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="bg-[#111111]/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-5 w-full">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 px-2">Popular Discoveries</p>
                  <div className="flex flex-col gap-1.5">
                     <div onClick={() => setIsSearchOpen(false)} className="text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer px-4 py-3 hover:bg-zinc-800/80 rounded-xl transition-colors flex items-center gap-3"><Search size={16} className="text-zinc-500"/> Heavyweight Hoodies</div>
                     <div onClick={() => setIsSearchOpen(false)} className="text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer px-4 py-3 hover:bg-zinc-800/80 rounded-xl transition-colors flex items-center gap-3"><Search size={16} className="text-zinc-500"/> Graphic Tees</div>
                     <div onClick={() => setIsSearchOpen(false)} className="text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer px-4 py-3 hover:bg-zinc-800/80 rounded-xl transition-colors flex items-center gap-3"><Search size={16} className="text-zinc-500"/> V.001 Drop</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
