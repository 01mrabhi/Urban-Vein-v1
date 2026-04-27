'use client';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, Sparkles, ShoppingBag, Plus } from 'lucide-react';

const LOOKS = [
  { 
    id: 1, 
    title: 'STREET CORE', 
    tag: 'Drop 01 // Archive', 
    image: '/products/lookbook1.jpg',
    hotspots: [{ x: '45%', y: '35%', label: 'Heavyweight Fit', price: '₹3,499' }]
  },
  { 
    id: 2, 
    title: 'URBAN NOMAD', 
    tag: 'Drop 01 // V.002', 
    image: '/products/lookbook2.jpg',
    hotspots: [{ x: '55%', y: '45%', label: 'Signature Series', price: '₹2,999' }]
  }
];


export default function Lookbook() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <section ref={containerRef} className="py-40 bg-zinc-950 overflow-hidden px-8">
      <div className="max-w-7xl mx-auto mb-32">
        <header className="flex flex-col md:flex-row items-end justify-between gap-8 border-b border-zinc-900 pb-16">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Sparkles size={16} className="text-red-600 fill-red-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">The Visual Archive</span>
             </div>
            <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none italic">
              Look<span className="text-red-600">book</span>
            </h2>
          </div>
          <p className="max-w-xs text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-relaxed italic text-right">
            A curated documentation of urban evolution. Captured in the concrete pulse. 2024 Collection.
          </p>
        </header>

        <div className="space-y-40">
          {LOOKS.map((look, idx) => (
            <div key={look.id} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-20 items-center`}>
              {/* Image Section */}
              <motion.div 
                className="relative w-full md:w-2/3 aspect-[3/4] rounded-[4rem] overflow-hidden group cursor-crosshair border border-zinc-900 bg-zinc-900 shadow-2xl"
              >
                <img 
                  src={look.image} 
                  alt={look.title} 
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" 
                />
                
                {/* Hotspots */}
                {look.hotspots.map((spot, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    className="absolute z-20"
                    style={{ left: spot.x, top: spot.y }}
                  >
                    <div className="group/spot relative">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-pulse group-hover/spot:animate-none group-hover/spot:bg-red-600 transition-colors">
                        <Plus size={16} className="text-black group-hover/spot:text-white group-hover/spot:rotate-45 transition-all" />
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover/spot:opacity-100 group-hover/spot:translate-x-2 transition-all pointer-events-none">
                        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl whitespace-nowrap backdrop-blur-xl shadow-2xl">
                          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">{spot.label}</p>
                          <p className="text-xs font-black text-red-600">{spot.price}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-red-600 tracking-widest">{look.tag}</span>
                    <h3 className="text-3xl font-black uppercase text-white">{look.title}</h3>
                  </div>
                  <button className="bg-white text-black p-4 rounded-2xl hover:bg-zinc-200 transition-colors">
                    <ShoppingBag size={20} />
                  </button>
                </div>
              </motion.div>

              {/* Text Sidebar */}
              <div className={`w-full md:w-1/3 flex flex-col ${idx % 2 === 0 ? 'items-start' : 'items-end text-right'} space-y-8`}>
                <motion.span 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-[10px] font-black text-zinc-800 uppercase tracking-[1em]"
                >
                  Document_{idx + 1}
                </motion.span>
                <div className="w-12 h-px bg-zinc-800"></div>
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-zinc-400 group-hover:text-white transition-colors duration-700">
                  Redefining <br />The <span className="text-white">Silhouette</span>
                </h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest leading-relaxed italic max-w-xs">
                  Engineered for high-performance movement. Our fabrics respond to the digital environment with thermal-reactive properties and structural integrity.
                </p>
                <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-red-600 transition-all group">
                  Explore Story <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
