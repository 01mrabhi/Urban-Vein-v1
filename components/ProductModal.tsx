'use client';
import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  Plus, 
  Maximize2, 
  Play, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: string;
    description: string;
    image: string;
    category: string;
  } | null;
}

const COLORS = [
  { id: 'black', name: 'PHANTOM BLACK', value: '#000000' },
  { id: 'red', name: 'LAVA RED', value: '#FF0000' },
  { id: 'blue', name: 'CORE BLUE', value: '#4A5568' },
];

const SIZES = ['M', 'L', 'XL', 'XXL'];

const RECOMMENDED = [
  { id: 'r1', name: 'PHANTOM HOODIE', price: '₹2,999.00', image: '/products/hoodi1-min.jpg' },
  { id: 'r2', name: 'LAVA TECH HOODIE', price: '₹3,299.00', image: '/products/hoodi2-min.jpg' },
  { id: 'r3', name: 'CORE BLUE HOODIE', price: '₹2,799.00', image: '/products/hoodi3-min.jpg' },
  { id: 'r4', name: 'URBAN SHIELD', price: '₹3,999.00', image: '/products/hoodie4-min.jpg' },
];

import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { isLiked, toggleLike } = useWishlist();

  const [showSizeChart, setShowSizeChart] = useState(false);
  const liked = product ? isLiked(product.id) : false;

  if (!product) return null;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
      addToCart({
        id: product.id,
        name: product.name,
        price: numericPrice,
        image: product.image,
        size: selectedSize,
        color: selectedColor.name,
        quantity: 1,
        category: product.category || 'Collection'
      });
      showToast(`Added ${product.name} to your bag`, 'success');
      onClose();
    }, 1500);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="product-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" onClick={onClose}></div>

            {/* Modal Content */}
            <motion.div 
              key="product-modal-content"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative w-full max-w-7xl h-full max-h-[90vh] bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Grid & Glow (as requested) */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 z-50 w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:scale-110 transition-all border border-zinc-800"
              >
                <X size={20} />
              </button>

              {/* Left: Image Section */}
              <div className="lg:w-1/2 h-full bg-zinc-900/50 p-8 lg:p-16 flex flex-col relative border-r border-zinc-900/50">
                 {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-10 relative z-10">
                  <span className="hover:text-white cursor-pointer transition-colors">Home</span>
                  <ChevronRight size={8} />
                  <span className="hover:text-white cursor-pointer transition-colors">Collections</span>
                  <ChevronRight size={8} />
                  <span className="text-red-600">{product.name}</span>
                </div>

                <div className="flex-1 relative flex items-center justify-center group">
                  <div className="absolute top-4 left-4 z-10">
                     <span className="bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">LIMITED DROP</span>
                  </div>
                  
                  <motion.img 
                    layoutId={`product-image-${product.id}`}
                    src={product.image} 
                    alt={product.name} 
                    className="max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                  />

                  {/* Thumbnail selector */}
                  <div className="absolute bottom-4 flex gap-4">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className={`w-16 h-16 rounded-2xl bg-zinc-950 border ${i === 0 ? 'border-red-600' : 'border-zinc-800'} overflow-hidden cursor-pointer hover:border-zinc-600 transition-all`}>
                         <img src={product.image} className="w-full h-full object-cover opacity-50 hover:opacity-100" alt="thumbnail" />
                      </div>
                    ))}
                     <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-red-600 cursor-pointer hover:bg-zinc-900 transition-all">
                      <Play size={20} className="fill-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Info Section */}
              <div className="lg:w-1/2 h-full overflow-y-auto p-8 lg:p-16 space-y-12 custom-scrollbar relative z-10">
                <header>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-white mb-2">{product.name}</h2>
                  <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter text-red-600 leading-none mb-4 italic">Oversized Tee</h1>
                  <p className="text-2xl font-black tracking-tighter">{product.price}</p>
                </header>

                {/* Color Selector */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select Color: <span className="text-white ml-2">{selectedColor.name}</span></h3>
                  </div>
                  <div className="flex gap-4">
                    {COLORS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${selectedColor.id === color.id ? 'border-red-600 scale-110' : 'border-transparent hover:scale-105'}`}
                      >
                        <div className="w-full h-full rounded-full border border-white/10" style={{ backgroundColor: color.value }}></div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Size Selector */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select Size</h3>
                    <button 
                      onClick={() => setShowSizeChart(true)}
                      className="text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-white underline decoration-zinc-800"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          selectedSize === size 
                          ? 'bg-red-600/10 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.1)]' 
                          : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:border-zinc-700 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Actions */}
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <button 
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="w-full bg-red-600 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-2xl shadow-red-600/30 hover:bg-red-500 transition-all active:scale-95 disabled:opacity-50 group"
                  >
                    {isAdding ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Plus size={20} />
                      </motion.div>
                    ) : (
                      <><ShoppingCart size={18} className="group-hover:translate-x-1 transition-transform" /> Add to Cart</>
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      toggleLike(product.id);
                      showToast(liked ? `Removed ${product.name} from Wishlist` : `Added ${product.name} to Wishlist`, 'success');
                    }}
                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all active:scale-95 group ${liked ? 'bg-red-600/10 border border-red-600/50 text-red-600' : 'bg-zinc-950 border border-zinc-900 text-white hover:bg-zinc-900'}`}
                  >
                    <Heart size={18} className={`transition-all ${liked ? 'fill-red-600 text-red-600 scale-110' : 'group-hover:scale-110 group-hover:text-red-600'}`} fill={liked ? "currentColor" : "none"} />
                    {liked ? 'Added to Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>

                {/* Description & Technical Specs */}
                <section className="space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 italic">// Description</h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider leading-relaxed italic">
                      {product.description} Engineered for a relaxed yet structured fit, it features dropped shoulders and a heavy-drape aesthetic that maintains its shape.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'MATERIAL', value: 'Cotton Lycra Blend' },
                      { label: 'WEIGHT', value: '240 GSM Premium Fabric' },
                      { label: 'FINISH', value: 'Smooth & Rich Finish' },
                      { label: 'DURABILITY', value: 'Maintains Shape Post-Wash' },
                    ].map((spec, i) => (
                      <div key={spec.label} className="bg-zinc-900/50 border border-zinc-900/50 p-5 rounded-3xl group hover:border-zinc-800 transition-colors">
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">{spec.label}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors italic">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Complete the Look (Recommended) */}
                <section className="pt-12 border-t border-zinc-900">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <span className="text-red-600 text-[10px] font-black italic tracking-widest">// Recommended</span>
                    </div>
                    <button className="text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-white flex items-center gap-1 group">
                      View All <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight italic mb-8">Complete the Look</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {RECOMMENDED.map((item) => (
                      <div key={item.id} className="group cursor-pointer">
                        <div className="aspect-[4/5] rounded-3xl bg-zinc-900 overflow-hidden mb-4 border border-zinc-900 hover:border-zinc-800 transition-all">
                          <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-tight mb-1">{item.name}</h4>
                        <p className="text-[10px] font-black text-red-600">{item.price}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {showSizeChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md"
            onClick={() => setShowSizeChart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowSizeChart(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-6 italic">// Size Chart (Inches)</h3>
              
              <div className="overflow-hidden rounded-2xl border border-zinc-800">
                <table className="w-full text-left text-xs uppercase tracking-widest font-bold">
                  <thead>
                    <tr className="bg-zinc-800/50 text-zinc-400">
                      <th className="p-4 border-b border-zinc-800">Size</th>
                      <th className="p-4 border-b border-zinc-800">Chest</th>
                      <th className="p-4 border-b border-zinc-800">Shoulder</th>
                      <th className="p-4 border-b border-zinc-800">Length</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    {[
                      { size: 'M', chest: '42', shoulder: '20.5', length: '27.5' },
                      { size: 'L', chest: '44', shoulder: '21', length: '28' },
                      { size: 'XL', chest: '46', shoulder: '21.5', length: '28.5' },
                      { size: 'XXL', chest: '48', shoulder: '22', length: '29' },
                    ].map((row) => (
                      <tr key={row.size} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 border-b border-zinc-800 text-red-600 font-black">{row.size}</td>
                        <td className="p-4 border-b border-zinc-800">{row.chest}</td>
                        <td className="p-4 border-b border-zinc-800">{row.shoulder}</td>
                        <td className="p-4 border-b border-zinc-800">{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <p className="mt-6 text-[8px] text-zinc-500 font-black uppercase tracking-widest text-center">
                * All measurements are in inches. Standard fit guaranteed.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
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
    </>
  );
}
