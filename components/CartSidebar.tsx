'use client';
import React from 'react';
import { useCart } from '../context/CartContext';
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function CartSidebar() {
  const { 
    items, 
    isSidebarOpen, 
    closeSidebar, 
    updateQuantity, 
    removeFromCart, 
    subtotal,
    cartCount 
  } = useCart();

  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 15.00;
  const taxes = subtotal * 0.08; // Example 8% tax
  const total = subtotal + shipping + taxes;

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#121417] border-l border-zinc-800 z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-red-500 fill-red-500" />
                <h2 className="text-lg font-black uppercase tracking-tight text-white">Your Vein</h2>
                <span className="bg-red-500/20 text-red-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/30">
                  {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <button 
                onClick={closeSidebar}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <ShoppingCart size={48} className="text-zinc-600" />
                  <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">Your bag is empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 relative group">
                    {/* Image */}
                    <div className="w-20 h-24 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 py-1 flex flex-col justify-between">
                      <div className="pr-6">
                        <h3 className="text-sm font-black uppercase tracking-tight text-white leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-1">
                          Size: {item.size} / Color: {item.color}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center bg-zinc-900/50 rounded-lg border border-zinc-800">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-black w-6 text-center text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        
                        <p className="text-sm font-black text-red-500">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="absolute top-1 right-0 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-zinc-800 bg-[#121417]">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-400">
                    <span>Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-400">
                    <span>Shipping (Express)</span>
                    <span className="text-white">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-400">
                    <span>Taxes</span>
                    <span className="text-white">${taxes.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 flex justify-between items-center border-t border-zinc-800/50">
                    <span className="text-sm font-black uppercase tracking-widest text-white">Total</span>
                    <span className="text-xl font-black text-red-500">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link 
                  href="/cart"
                  onClick={closeSidebar}
                  className="w-full bg-[#FF2B2B] hover:bg-red-500 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] group shadow-[0_0_20px_rgba(255,43,43,0.2)]"
                >
                  Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <p className="text-center text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 mt-4 italic">
                  Secure Checkout Powered by Urbanvein Core
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
