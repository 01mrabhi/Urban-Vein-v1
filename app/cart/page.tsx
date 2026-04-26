'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, cartCount } = useCart();
  const [coupon, setCoupon] = useState('');

  const shipping = subtotal === 0 ? 0 : 69.00;
  const taxes = 0;
  const total = subtotal + shipping;

  const handleWhatsAppCheckout = () => {
    const adminPhone = "918264966094";
    let message = "NEW ORDER REQUEST\n\n";
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   - Size: ${item.size}\n`;
      message += `   - Color: ${item.color}\n`;
      message += `   - Qty: ${item.quantity}\n`;
      message += `   - Price: INR ${item.price.toFixed(2)}\n\n`;
    });
    message += "ORDER SUMMARY\n";
    message += `   Subtotal: INR ${subtotal.toFixed(2)}\n`;
    message += `   Shipping: INR ${shipping.toFixed(2)}\n`;
    message += `   Total: INR ${total.toFixed(2)}\n\n`;
    message += "Payment Request: Please share the payment details to confirm my order.";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-red-600/30">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-20">
        {/* Progress Tracker (Subtle) */}
        <div className="flex items-center gap-4 mb-12 opacity-50">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">01 Bag</span>
          <div className="w-8 h-px bg-zinc-800"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">02 Checkout</span>
          <div className="w-8 h-px bg-zinc-800"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">03 Confirm</span>
        </div>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-zinc-900 pb-16">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
              Your <span className="text-red-600">Bag</span>
            </h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest italic">
              {items.length} {items.length === 1 ? 'Item' : 'Items'} Ready for Dispatch. Engineered for the Digital Frontier.
            </p>
          </div>
          <Link
            href="/#shop"
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-all"
          >
            Continue Shopping <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </header>

        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Left: Cart Items */}
              <div className="lg:col-span-8 space-y-8">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.cartItemId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative flex flex-col md:flex-row gap-8 bg-zinc-900/30 border border-zinc-900/50 p-8 rounded-[2.5rem] hover:border-zinc-800 transition-all hover:bg-zinc-900/50"
                  >
                    {/* Item Image */}
                    <div className="w-full md:w-48 aspect-[4/5] bg-zinc-950 rounded-3xl overflow-hidden flex-shrink-0 border border-zinc-900">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-red-600 mb-2 block">// {item.category}</span>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white">{item.name}</h3>
                          </div>
                          <p className="text-xl font-black tracking-tighter text-white">₹{item.price.toFixed(2)}</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <div className="bg-zinc-950 border border-zinc-900 px-4 py-2 rounded-xl">
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mr-2">Size:</span>
                            <span className="text-[10px] font-black uppercase">{item.size}</span>
                          </div>
                          <div className="bg-zinc-950 border border-zinc-900 px-4 py-2 rounded-xl">
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mr-2">Color:</span>
                            <span className="text-[10px] font-black uppercase">{item.color}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-8 pt-8 border-t border-zinc-900/50">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-6 bg-zinc-950/50 p-2 rounded-2xl border border-zinc-900">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-600 transition-all group/remove"
                        >
                          <Trash2 size={12} className="group-hover/remove:scale-110" /> Remove Item
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Shipping Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                  {[
                    { icon: Truck, title: 'Global Logistics', desc: 'Secure transit with full telemetry tracking.' },
                    { icon: RotateCcw, title: 'Seamless Returns', desc: '14-day return cycle for unaltered products.' },
                    { icon: ShieldCheck, title: 'Authenticity Lock', desc: 'Each drop contains encrypted identity tags.' },
                  ].map((feature, i) => (
                    <div key={i} className="bg-zinc-900/20 border border-zinc-900/50 p-6 rounded-[2rem] space-y-3">
                      <feature.icon size={18} className="text-red-600" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">{feature.title}</h4>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 leading-relaxed italic">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Summary */}
              <div className="lg:col-span-4">
                <div className="sticky top-32 space-y-8">
                  <div className="bg-zinc-900/50 border border-zinc-900 rounded-[3rem] p-10 space-y-10 relative overflow-hidden group">
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] rounded-full group-hover:bg-red-600/10 transition-all"></div>

                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Order <span className="text-red-600">Summary</span></h3>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-zinc-500 italic">Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-zinc-500 italic">Customization Layer</span>
                        <span className="text-green-500">FREE</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-zinc-500 italic">Express Shipping</span>
                        <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-zinc-500 italic">Taxes</span>
                        <span>₹{taxes.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-zinc-800 my-8"></div>
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Total Amount</p>
                          <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Inclusive of all duties / taxes</p>
                        </div>
                        <p className="text-4xl font-black tracking-tighter text-white">₹{total.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Promo Code */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="PROMO CODE"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] focus:border-red-600 outline-none transition-all placeholder:text-zinc-700"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-500 transition-colors">
                          <Plus size={18} />
                        </button>
                      </div>

                      <button
                        onClick={handleWhatsAppCheckout}
                        className="w-full bg-green-600 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-2xl shadow-green-600/30 hover:bg-green-500 transition-all active:scale-95 group"
                      >
                        Order via WhatsApp <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>

                      <p className="text-center text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center justify-center gap-2">
                        <ShieldCheck size={12} className="text-green-500" /> AES-256 Encrypted Connection
                      </p>
                    </div>
                  </div>

                  {/* Trust Badge */}
                  <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] flex items-center gap-6">
                    <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center">
                      <ShoppingBag size={20} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Buy Now, Pay Later</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 italic">Klarna/Afterpay available at checkout.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-40 space-y-10 text-center"
            >
              <div className="w-32 h-32 bg-zinc-900/50 rounded-full flex items-center justify-center border border-zinc-800 animate-pulse">
                <ShoppingBag size={48} className="text-zinc-700" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Your Bag is <span className="text-red-600">Empty</span></h2>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] italic max-w-sm">The digital frontier awaits. Redefine your aesthetic with our latest drops.</p>
              </div>
              <Link
                href="/#shop"
                className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-200 transition-all"
              >
                Start Exploring
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
