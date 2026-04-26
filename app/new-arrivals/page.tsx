'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import { supabase } from '../../lib/supabase';
import { Product } from '../../lib/data';
import { useRouter } from 'next/navigation';

export default function NewArrivalsPage() {
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
        // Map original_id to id for frontend compatibility
        const mappedProducts = data.map(p => ({
          ...p,
          id: p.original_id
        }));
        // We'll show specific products for New Arrivals or just slice the newest
        // For now, let's just reverse and show top 4 as new arrivals
        setProducts(mappedProducts.reverse().slice(0, 4));
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-red-600/30">
      <Navbar />
      <section className="p-6 max-w-[1600px] mx-auto pt-24 pb-32">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Latest Drop</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] italic">New Arrivals</h1>
        </div>
        
        {isLoading ? (
           <div className="flex justify-center items-center h-64">
             <span className="w-8 h-8 rounded-full border-4 border-zinc-800 border-t-red-600 animate-spin"></span>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard 
                key={product.id}
                id={product.id}
                name={product.name} 
                price={product.price} 
                image={product.image} 
                description={product.description}
                badge={product.badge}
                actionType={product.actionType as 'quick-add' | 'waitlist' | undefined}
                onClick={() => router.push(`/products/${product.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
