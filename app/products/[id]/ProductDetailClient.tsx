'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Minus, Heart, Shield, Package, RefreshCw, ChevronDown, ShoppingBag, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useToast } from '../../../context/ToastContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { PRODUCTS, parseProductSizes } from '../../../lib/data';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetailClient({ productId }: { productId: string }) {
  const router = useRouter();
  const id = productId;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isLiked, toggleLike } = useWishlist();

  const liked = product ? isLiked(product.id) : false;

  const isOutOfStock = Boolean(product?.is_out_of_stock) || product?.badge === 'OUT OF STOCK' || (typeof product?.stock_quantity === 'number' && product.stock_quantity <= 0);
  const isUpcoming = Boolean(product?.is_upcoming) || product?.badge === 'UPCOMING DROP';

  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const availableSizes = parseProductSizes(product);

  useEffect(() => {
    if (availableSizes && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0] || 'L');
    }
  }, [product, availableSizes]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !product?.image_back) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setCurrentImage(prev => prev === product.image ? product.image_back : product.image);
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      
      try {
        // Prioritize live database updates from API
        const res = await fetch(`/api/products/manage?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (res.ok && data.product) {
          setProduct(data.product);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error fetching live product from API:', err);
      }

      // Fallback to static PRODUCTS array if API / Database fetch fails
      const localProduct = PRODUCTS.find(p => p.id === id || p.original_id === id);
      if (localProduct) {
        setProduct(localProduct);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Decrypting System Data...</p>
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
    if (isOutOfStock) {
      showToast(`${product.name} is currently out of stock.`, 'error');
      return;
    }
    if (isUpcoming) {
      showToast(`We will notify you when ${product.name} drops!`, 'info');
      return;
    }
    const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
    addToCart({
      id: `${product.id}-${selectedSize}`,
      name: product.name,
      price: numericPrice,
      image: product.image,
      size: selectedSize,
      color: 'Phantom Black',
      quantity,
      category: product.category,
      is_upcoming: isUpcoming,
      is_out_of_stock: isOutOfStock
    });
    showToast(`Added ${product.name} to your bag`, 'success');
  };

  const toggleAccordion = (accordionId: string) => {
    if (activeAccordion === accordionId) setActiveAccordion(null);
    else setActiveAccordion(accordionId);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-red-600/30">
      <Navbar />
      
      <div className="pt-24 lg:pt-32 pb-32 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen">
        
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
          <div className="w-full lg:w-1/2 relative lg:sticky lg:top-32 flex flex-col gap-4">
            <div 
              className="group relative w-full h-auto aspect-[4/5] overflow-hidden rounded-[3rem] bg-zinc-900 border border-zinc-800"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <motion.div 
                key={currentImage || (product.image_back || product.image)}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full h-full relative"
              >
                <Image 
                  src={currentImage || (product.image_back || product.image)} 
                  alt={product.name} 
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="w-full h-full object-cover lg:grayscale lg:hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
              </motion.div>
              
              {(product.badge || isOutOfStock || isUpcoming) && (
                <div className="absolute top-8 left-8 z-10">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg ${
                    isOutOfStock 
                      ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' 
                      : isUpcoming 
                      ? 'bg-yellow-500 text-black font-extrabold shadow-[0_0_30px_rgba(234,179,8,0.4)]' 
                      : 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)]'
                  }`}>
                    {isOutOfStock ? 'OUT OF STOCK' : isUpcoming ? 'UPCOMING DROP' : product.badge}
                  </span>
                </div>
              )}

              {product.image_back && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 lg:hidden bg-zinc-950/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${currentImage === product.image_back ? 'bg-white' : 'bg-white/30'}`}></div>
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${currentImage === product.image ? 'bg-white' : 'bg-white/30'}`}></div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.image_back && (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setCurrentImage(product.image_back)}
                  className={`relative aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all ${currentImage === product.image_back ? 'border-red-600' : 'border-zinc-800 opacity-60 hover:opacity-100'}`}
                >
                  <Image src={product.image_back} alt="Back view" fill className="object-cover" />
                  <span className="absolute bottom-2 left-2 text-[9px] font-black uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded text-white backdrop-blur-sm">Back Print</span>
                </button>
                <button 
                  onClick={() => setCurrentImage(product.image)}
                  className={`relative aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all ${currentImage === product.image ? 'border-red-600' : 'border-zinc-800 opacity-60 hover:opacity-100'}`}
                >
                  <Image src={product.image} alt="Front view" fill className="object-cover" />
                  <span className="absolute bottom-2 left-2 text-[9px] font-black uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded text-white backdrop-blur-sm">Front Print</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-red-500 font-bold uppercase tracking-[0.2em] text-xs">
                  {product.category || 'Urban Series'}
                </span>
                <button 
                  onClick={() => toggleLike(product.id)}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-red-600 transition-colors group"
                >
                  <Heart size={18} className={`transition-colors ${liked ? 'fill-red-600 text-red-600' : 'text-zinc-400 group-hover:text-red-500'}`} />
                </button>
              </div>

              <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter text-white mb-6">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-3xl font-black text-white">{product.price}</span>
                <span className="text-sm font-semibold text-zinc-500 line-through">₹1,299.00</span>
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                  SAVE 57%
                </span>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-10 font-medium">
                {product.description}
              </p>

              {/* Size Selector */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Select Size</label>
                  <button 
                    onClick={() => setShowSizeChart(true)}
                    className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wider underline transition-colors"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {SIZES.map((size) => {
                    const isAvailable = availableSizes.includes(size);
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        title={isAvailable ? `Select Size ${size}` : `Size ${size} not available for this item`}
                        className={`py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all border ${
                          !isAvailable
                            ? 'bg-zinc-950/40 border-zinc-900/40 text-zinc-700 opacity-40 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-red-600 text-white border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] cursor-pointer'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white cursor-pointer'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-10">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 block mb-4">Quantity</label>
                <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-2">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-16 text-center font-black text-white">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mb-12">
                {isOutOfStock ? (
                  <button
                    disabled
                    className="w-full bg-zinc-800 text-zinc-500 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 cursor-not-allowed shadow-none"
                  >
                    Out of Stock
                  </button>
                ) : isUpcoming ? (
                  <button
                    onClick={() => showToast(`We will notify you when ${product.name} drops!`, 'info')}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(234,179,8,0.3)] transition-all transform active:scale-98"
                  >
                    <Sparkles size={20} />
                    Notify Me On Drop ✨
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition-all transform active:scale-98"
                  >
                    <ShoppingBag size={20} />
                    Add to Cart — {product.price}
                  </button>
                )}
              </div>

              {/* Collapsible Accordions */}
              <div className="border-t border-zinc-800 divide-y divide-zinc-800/60">
                <div className="py-4">
                  <button 
                    onClick={() => toggleAccordion('details')}
                    className="w-full flex justify-between items-center text-xs font-black uppercase tracking-widest text-zinc-300 py-2 hover:text-white transition-colors"
                  >
                    <span>Product Specifications</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${activeAccordion === 'details' ? 'rotate-180 text-red-500' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'details' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 pb-2 text-xs text-zinc-400 font-medium space-y-2 leading-relaxed"
                      >
                        <p>&bull; 100% Heavyweight Comb Cotton (240 GSM)</p>
                        <p>&bull; High-Density Screen Print on Front & Back</p>
                        <p>&bull; Oversized Drop Shoulder Fit</p>
                        <p>&bull; Pre-shrunk Fabric to Prevent Shrinkage</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="py-4">
                  <button 
                    onClick={() => toggleAccordion('shipping')}
                    className="w-full flex justify-between items-center text-xs font-black uppercase tracking-widest text-zinc-300 py-2 hover:text-white transition-colors"
                  >
                    <span>Express PAN-India Shipping</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${activeAccordion === 'shipping' ? 'rotate-180 text-red-500' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'shipping' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 pb-2 text-xs text-zinc-400 font-medium space-y-2 leading-relaxed"
                      >
                        <p>Dispatched within 24-48 hours via Delhivery / BlueDart Express. Estimated delivery 3-5 business days across India.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {showSizeChart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full relative"
            >
              <button 
                onClick={() => setShowSizeChart(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Oversized Fit Guide</h3>
              <p className="text-xs text-zinc-400 font-medium mb-6">Measurements in inches (Chest x Length)</p>

              <div className="border border-zinc-800 rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-zinc-900 p-3 font-black uppercase text-zinc-400 border-b border-zinc-800">
                  <span>Size</span>
                  <span>Chest (in)</span>
                  <span>Length (in)</span>
                </div>
                <div className="grid grid-cols-3 p-3 border-b border-zinc-800/50 text-white font-bold bg-zinc-900/30">
                  <span>Small (S)</span>
                  <span>42&quot;</span>
                  <span>28&quot;</span>
                </div>
                <div className="grid grid-cols-3 p-3 border-b border-zinc-800/50 text-white font-bold">
                  <span>Medium (M)</span>
                  <span>44&quot;</span>
                  <span>29&quot;</span>
                </div>
                <div className="grid grid-cols-3 p-3 border-b border-zinc-800/50 text-white font-bold bg-zinc-900/30">
                  <span>Large (L)</span>
                  <span>46&quot;</span>
                  <span>30&quot;</span>
                </div>
                <div className="grid grid-cols-3 p-3 border-b border-zinc-800/50 text-white font-bold">
                  <span>X-Large (XL)</span>
                  <span>48&quot;</span>
                  <span>31&quot;</span>
                </div>
                <div className="grid grid-cols-3 p-3 text-white font-bold bg-zinc-900/30">
                  <span>XX-Large (XXL)</span>
                  <span>50&quot;</span>
                  <span>32&quot;</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
