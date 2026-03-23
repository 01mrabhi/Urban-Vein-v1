'use client';
import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { motion } from 'motion/react';

const CATEGORIES = [
  'Oversized Collection',
  'Graphic Series',
  'Essential Solids',
  'Limited Drops'
];

type Product = {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
  badge?: string;
  actionType?: 'quick-add' | 'waitlist';
};

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Oversized Heavy Tee',
    price: '$85.00',
    description: 'Heavyweight 300GSM premium cotton, drop shoulder fit.',
    image: '/products/Tshirt1-min.jpg',
    category: 'Oversized Collection'
  },
  {
    id: '2',
    name: 'Cyber Graphic Tee',
    price: '$95.00',
    description: 'Limited edition high-density screen print with architectural aesthetics.',
    image: '/products/Tshirt2-min.jpg',
    category: 'Graphic Series'
  },
  {
    id: '3',
    name: 'Midnight Essential',
    price: '$65.00',
    description: 'Minimalist silhouette for everyday layering. Pre-shrunk silicone wash.',
    image: '/products/Tshirt3-min.jpg',
    category: 'Essential Solids'
  },
  {
    id: '4',
    name: 'Red Glow Limited',
    price: '$120.00',
    description: 'Numbered release. Only 50 units produced globally. Features reactive glow.',
    image: '/products/Tshirt4-min.jpg',
    category: 'Limited Drops',
    badge: 'RARE',
    actionType: 'waitlist'
  },
  {
    id: '5',
    name: 'Phantom Tech Hoodie',
    price: '$145.00',
    description: 'Triple-fleece structure with reinforced architectural stitching.',
    image: '/products/hoodi1-min.jpg',
    category: 'Oversized Collection'
  },
  {
    id: '6',
    name: 'Lava Series Hoodie',
    price: '$155.00',
    description: 'Thermal-reactive graphic on heavyweight 400GSM loopback terry.',
    image: '/products/hoodi2-min.jpg',
    category: 'Graphic Series'
  },
  {
    id: '7',
    name: 'Core Blue Variant',
    price: '$135.00',
    description: 'Brushed interior for maximum comfort in urban environments.',
    image: '/products/hoodi3-min.jpg',
    category: 'Essential Solids'
  },
  {
    id: '8',
    name: 'Urban Shield Hoodie',
    price: '$180.00',
    description: 'Water-repellent finish with magnetic stash pockets. Final Drop.',
    image: '/products/hoodie4-min.jpg',
    category: 'Limited Drops',
    badge: 'ELITE'
  }
];

export default function ProductSection() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <section id="shop" className="py-24 px-8 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-px bg-red-600"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Available Now</span>
          </div>
          <h2 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
            Premium <span className="text-red-600 italic">Streetwear</span><br />Core
          </h2>
          <p className="max-w-xl text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed italic">
            Futuristic aesthetics blended with high-grade fabrics. Engineered for the urban nomad. Discover the next evolution of essential wear.
          </p>
        </header>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeCategory === cat 
                ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20' 
                : 'bg-transparent border-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {PRODUCTS.map((product) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              onClick={() => handleOpenModal(product)}
            />
          ))}
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </section>
  );
}
