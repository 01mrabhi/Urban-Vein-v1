'use client';
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { motion } from 'motion/react';
import { CATEGORIES, Product } from '../lib/data';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function ProductSection() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('Error fetching products:', error);
      } else if (data) {
        // Map database fields to Product type
        const formattedProducts = data.map(p => ({
          ...p,
          id: p.original_id // map original_id to id for backwards compatibility with frontend
        }));
        setProducts(formattedProducts);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const handleNavigateToProduct = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  const filteredProducts = products.filter(p => p.category === activeCategory);

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
        {isLoading ? (
          <div className="flex justify-center py-20">
             <span className="w-8 h-8 rounded-full border-4 border-zinc-800 border-t-red-600 animate-spin"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                {...product} 
                onClick={() => handleNavigateToProduct(product)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
