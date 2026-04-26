'use client';
import React from 'react';
import { Send, Instagram, Facebook, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 pt-24 pb-12 px-8 border-t border-zinc-900 relative overflow-hidden">
      {/* Background Grid Design */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Ambient Glows around edges */}
        <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-red-600/10 blur-[130px] rounded-[100%] -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-red-600/10 blur-[130px] rounded-[100%] translate-x-1/3 translate-y-1/3"></div>
        
        {/* Perspective Grid Floor */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300%] h-[150%] origin-bottom opacity-60"
          style={{
            transform: 'perspective(1000px) rotateX(75deg) translateY(5%)',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 80%)'
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(220, 38, 38, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(220, 38, 38, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px',
              backgroundPosition: 'center bottom'
            }}
          ></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-2">
              <Sparkles size={24} className="text-red-600 fill-red-600" />
              <span className="text-2xl font-black uppercase tracking-tighter italic">UrbanVein</span>
            </div>
            <p className="max-w-sm text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed italic">
              Crafting the future of street aesthetic through ambient technology and premium materiality.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://www.instagram.com/harkarclothing?igsh=ODdxYXdiZGtqajYx&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-red-600 hover:scale-110 transition-all">
                <Instagram size={20} />
              </a>
              <a href="https://www.facebook.com/share/1Ar2xa8dgX/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-red-600 hover:scale-110 transition-all">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Support</h3>
              <ul className="space-y-4">
                {['Track Order', 'Shipping', 'Returns', 'Size Guide'].map((link) => (
                  <li key={link}>
                    <Link href="/help" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Join the Vein</h3>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-zinc-900/50 border border-zinc-900 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-red-600 transition-colors placeholder:text-zinc-700"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-600/20">
                <Send size={18} />
              </button>
            </div>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">
              Subscribe to unlock early access to drops and exclusive content.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-8">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700">
            © 2024 URBANVEIN LABS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
            <a href="https://www.instagram.com/harkarclothing?igsh=ODdxYXdiZGtqajYx&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Instagram</a>
            <a href="https://www.facebook.com/share/1Ar2xa8dgX/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
