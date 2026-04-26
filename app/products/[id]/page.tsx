'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { Product } from '../../../lib/data';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Minus, Heart, Shield, Package, RefreshCw, ChevronDown, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../context/ToastContext';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

const SIZES = ['M', 'L', 'XL', 'XXL'];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('original_id', id)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
      } else if (data) {
        setProduct({
          ...data,
          id: data.original_id
        });
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center selection:bg-red-600/30">
        <span className="w-8 h-8 rounded-full border-4 border-zinc-800 border-t-red-600 animate-spin mb-4"></span>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Loading Product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center selection:bg-red-600/30">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Product Not Found.</h1>
        <Link href="/" className="text-red-600 font-bold uppercase tracking-widest hover:underline text-sm">Return Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
    addToCart({
      id: `${product.id}-${selectedSize}`,
      name: product.name,
      price: numericPrice,
      image: product.image,
      size: selectedSize,
      color: 'Phantom Black',
      quantity,
      category: product.category
    });
    showToast(`Added ${product.name} to your bag`, 'success');
  };

  const toggleAccordion = (id: string) => {
    if (activeAccordion === id) setActiveAccordion(null);
    else setActiveAccordion(id);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-red-600/30">
      <Navbar />
      
      <div className="pt-8 pb-32 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-12 border-b border-zinc-900 pb-6 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Archive
          </button>
          
          <div className="hidden md:flex items-center gap-3 text-[10px] uppercase font-black tracking-[0.2em] text-zinc-600">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/#shop" className="hover:text-white transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </div>

        {/* Product Container */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 relative lg:sticky lg:top-32 h-auto lg:h-[80vh]">
            <div className="group relative w-full h-full aspect-[4/5] lg:aspect-auto overflow-hidden rounded-[3rem] bg-zinc-900 border border-zinc-800">
              <motion.img 
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              />
              
              {product.badge && (
                <div className="absolute top-8 left-8 z-10">
                  <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start lg:py-10">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">{product.category}</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6 italic">
                {product.name}
              </h1>
              
              <div className="flex items-end justify-between mb-8 border-b border-zinc-900 pb-8">
                <p className="text-3xl font-black text-white">{product.price}</p>
                <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">In Stock</span>
                </div>
              </div>

              <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest leading-relaxed mb-12 max-w-xl">
                {product.description} Engineered for high-performance movement and structural integrity. Featuring architectural silhouettes and premium fabric blends.
              </p>
            </motion.div>

            {/* Selectors */}
            <div className="space-y-10 mb-12">
              {/* Size Selector */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase text-white tracking-[0.2em]">Select Size</h3>
                  <button className="text-[10px] text-zinc-500 hover:text-white font-bold uppercase tracking-widest underline decoration-zinc-800 underline-offset-4 transition-colors">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-14 flex-1 min-w-[60px] rounded-2xl flex items-center justify-center font-black transition-all duration-300 ${
                        selectedSize === size 
                          ? 'bg-white text-black scale-105 shadow-[0_10px_30px_rgba(255,255,255,0.1)]' 
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center justify-between w-full sm:w-40 bg-zinc-900 border border-zinc-800 rounded-3xl p-2 h-16">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-2xl transition-all"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-black text-lg w-8 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-12 h-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-2xl transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex-1 w-full flex gap-4 h-16">
                  {product.actionType === 'waitlist' ? (
                     <button className="flex-1 rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all">
                       Join Waitlist
                     </button>
                  ) : (
                    <button 
                      onClick={handleAddToCart}
                      className="flex-1 rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] bg-red-600 text-white hover:bg-red-500 shadow-[0_10px_40px_rgba(220,38,38,0.2)] hover:shadow-[0_10px_60px_rgba(220,38,38,0.4)] transition-all flex justify-center items-center gap-3 group"
                    >
                      <ShoppingBag size={18} className="group-hover:-translate-y-1 transition-transform" />
                      Checkout Sequence
                    </button>
                  )}
                  
                  <button className="w-16 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all">
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-4 pt-8 border-t border-zinc-900">
              
              {/* Architecture/Material */}
              <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950">
                <button 
                  onClick={() => toggleAccordion('details')}
                  className="w-full flex justify-between items-center p-6 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                >
                  <span className="text-xs font-black uppercase text-white tracking-[0.2em]">Architecture & Fabrics</span>
                  <motion.div animate={{ rotate: activeAccordion === 'details' ? 180 : 0 }}>
                    <ChevronDown size={18} className="text-zinc-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeAccordion === 'details' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 text-xs text-zinc-400 font-bold uppercase tracking-widest leading-relaxed border-t border-zinc-900">
                        <ul className="space-y-4">
                          <li className="flex gap-4 items-start"><span className="text-red-600 mt-0.5">■</span> Premium heavyweight blend. Pre-shrunk formulation.</li>
                          <li className="flex gap-4 items-start"><span className="text-red-600 mt-0.5">■</span> Silicone washed for a brutalist, structured fall.</li>
                          <li className="flex gap-4 items-start"><span className="text-red-600 mt-0.5">■</span> Architectural drop shoulders mapped for mobility.</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Delivery Protocol */}
              <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950">
                <button 
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex justify-between items-center p-6 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                >
                  <span className="text-xs font-black uppercase text-white tracking-[0.2em] flex items-center gap-3">
                    Delivery Protocol
                  </span>
                  <motion.div animate={{ rotate: activeAccordion === 'shipping' ? 180 : 0 }}>
                    <ChevronDown size={18} className="text-zinc-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 text-xs text-zinc-400 font-bold uppercase tracking-widest leading-relaxed border-t border-zinc-900 space-y-4">
                        <div className="flex gap-4 items-center">
                          <Package size={20} className="text-zinc-500" />
                          <p>Standard Global Network: 5-7 Business Days</p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <RefreshCw size={20} className="text-zinc-500" />
                          <p>30-Day Return Window. Subject to inspection.</p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Shield size={20} className="text-zinc-500" />
                          <p>System Authenticated & Encrypted Distribution.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
