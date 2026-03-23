'use client';
import React from 'react';
import Navbar from '../../components/Navbar';
import { 
  Package, 
  Truck, 
  RefreshCcw, 
  Ruler, 
  HelpCircle, 
  History,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';

const ORDERS = [
  {
    id: '#UV-99210',
    date: 'May 14, 2024',
    item: 'Custom Urban-Tee "VOID"',
    price: '$45.00',
    status: 'Shipped',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '#UV-98442',
    date: 'May 10, 2024',
    item: 'Oversize Cargo Hoodie',
    price: '$120.00',
    status: 'Processing',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '#UV-97109',
    date: 'Apr 22, 2024',
    item: 'Vein Essential Pack (3x)',
    price: '$85.00',
    status: 'Delivered',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7ec28?q=80&w=200&auto=format&fit=crop'
  }
];

const QUICK_LINKS = [
  { icon: RefreshCcw, title: 'Return Policy', desc: '30-day hassle-free returns on all streetwear items.' },
  { icon: Truck, title: 'Shipping Info', desc: 'Global expedited shipping with tracking IDs.' },
  { icon: Ruler, title: 'Size Guide', desc: 'Detailed dimensions for our techwear & oversize fits.' },
  { icon: HelpCircle, title: 'Contact Us', desc: '24/7 dedicated support for our global community.' }
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <header className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-600 leading-none"
          >
            Help & Support
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-red-600 font-bold uppercase tracking-[0.2em] text-sm mt-4"
          >
            Manage your orders and explore our service policies.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Track & Links */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Track Order Card */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Truck size={120} className="rotate-12" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600">
                    <Package size={20} />
                  </div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Track Your Order</h2>
                </div>
                
                <p className="text-sm text-zinc-400 mb-8 max-w-sm">
                  Enter your order ID and the email address used during purchase to get real-time status updates.
                </p>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Order ID</label>
                    <input 
                      type="text" 
                      placeholder="#UV-99210"
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="nexus@urbanvein.com"
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                  <button className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-2xl shadow-red-600/20 hover:scale-[1.02] transition-all active:scale-95">
                    <History size={18} /> Track Shipment
                  </button>
                </form>
              </div>
            </motion.section>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 gap-4">
              {QUICK_LINKS.map((link, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-3xl hover:border-zinc-700 transition-all cursor-pointer group"
                >
                  <link.icon className="text-red-600 mb-4 group-hover:scale-110 transition-transform" size={20} />
                  <h3 className="text-sm font-black uppercase tracking-tight mb-2">{link.title}</h3>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">{link.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Recent Orders */}
          <div className="lg:col-span-7">
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900/20 border border-zinc-900 rounded-[2.5rem] p-8 lg:p-12"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600">
                    <History size={24} />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Recent Orders</h2>
                </div>
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 hover:text-red-500 transition-colors flex items-center gap-2">
                  View All History <ArrowRight size={14} />
                </button>
              </div>

              <div className="space-y-4">
                {ORDERS.map((order, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-zinc-950/50 border border-zinc-900 hover:border-zinc-800 transition-all group"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800">
                      <img src={order.image} alt={order.item} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                        <span className="text-xs font-black uppercase tracking-widest text-white">{order.item}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                          order.status === 'Shipped' ? 'bg-green-600/10 text-green-500' :
                          order.status === 'Processing' ? 'bg-yellow-600/10 text-yellow-500' :
                          'bg-blue-600/10 text-blue-500'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Order {order.id} • {order.date}</p>
                    </div>

                    <div className="text-center sm:text-right">
                      <p className="text-lg font-black tracking-tighter mb-2">{order.price}</p>
                      <button className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors flex items-center gap-1 mx-auto sm:ml-auto">
                        Details <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Empty State / No Older Activities */}
                <div className="mt-8 border-2 border-dashed border-zinc-900 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <TrendingDown size={24} className="text-zinc-600" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">No older activities</p>
                </div>
              </div>
            </motion.section>
          </div>
        </div>

        {/* Support Grid Footer */}
        <footer className="mt-20 border-t border-zinc-900 pt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-600">
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-red-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-red-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-red-600 transition-colors">Instagram</a>
            </div>
            <p>© 2024 UrbanVein Industries. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
