'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import { supabase } from '../../lib/supabase';
import { Product } from '../../lib/data';
import { useRouter } from 'next/navigation';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchNewArrivals() {
      setLoading(true);
      // For now, we'll fetch all products as "New Arrivals"
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(4);
      
      if (error) {
        console.error('Error fetching new arrivals:', error);
      } else if (data) {
        const mappedProducts: Product[] = data.map(p => ({
          ...p,
          id: p.original_id,
          actionType: p.action_type
        }));
        setProducts(mappedProducts);
      }
      setLoading(false);
    }

    fetchNewArrivals();
  }, []);

  const handleNavigateToProduct = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-20 lg:pt-24">
      <Navbar />
      <section className="p-6 md:p-12 lg:p-24 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-px bg-red-600"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Fresh System Drop</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-12 italic">New <span className="text-red-600">Arrivals</span></h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-900 aspect-[4/5] rounded-[2.5rem]"></div>
            ))
          ) : (
            products.map((product) => (
              <ProductCard 
                key={product.id} 
                {...product} 
                onClick={() => handleNavigateToProduct(product)}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
