'use client';
import React, { useState } from 'react';
import { Sparkles, Copy, Check, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AnnouncementBar() {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const couponCode = 'WELCOME100';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative bg-gradient-to-r from-red-950 via-zinc-950 to-red-950 border-b border-red-600/30 text-white overflow-hidden z-[110]"
        >
          {/* Subtle glowing animated backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_70%)] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs gap-3">
            {/* Left/Center Message */}
            <div className="flex-1 flex items-center justify-center gap-2 md:gap-3 text-center flex-wrap">
              <span className="flex items-center gap-1.5 text-red-500 font-black uppercase tracking-wider text-[10px] md:text-xs">
                <Sparkles size={13} className="animate-pulse text-red-400" />
                <span>Special Welcome Drop</span>
              </span>

              <span className="hidden sm:inline text-zinc-600">&#47;&#47;</span>

              <span className="text-zinc-300 font-medium text-[11px] md:text-xs">
                Get <span className="text-white font-black">FLAT ₹100 OFF</span> on your order!
              </span>

              {/* Coupon Code Pill */}
              <button
                onClick={handleCopy}
                className="group inline-flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 hover:border-red-500 text-white px-2.5 py-0.5 rounded-full transition-all cursor-pointer text-[10px] md:text-[11px] font-mono font-black tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.2)] active:scale-95"
                title="Click to copy coupon code"
              >
                <Tag size={10} className="text-red-400" />
                <span>{couponCode}</span>
                {copied ? (
                  <span className="inline-flex items-center text-green-400 text-[9px] font-bold uppercase tracking-wider ml-1">
                    <Check size={10} className="mr-0.5" /> Copied!
                  </span>
                ) : (
                  <Copy size={10} className="text-zinc-400 group-hover:text-white transition-colors ml-0.5" />
                )}
              </button>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-white/5 flex-shrink-0"
              aria-label="Dismiss banner"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
