import React from 'react';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';

export default function NewArrivalsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <section className="p-6">
        <h1 className="text-4xl font-bold mb-6">New Arrivals</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard name="Urban Hoodie" price="$89" image="https://picsum.photos/seed/hoodie/400/400" />
          <ProductCard name="Street Tee" price="$39" image="https://picsum.photos/seed/tee/400/400" />
          <ProductCard name="Cargo Pants" price="$129" image="https://picsum.photos/seed/pants/400/400" />
          <ProductCard name="Beanie" price="$29" image="https://picsum.photos/seed/beanie/400/400" />
        </div>
      </section>
    </main>
  );
}
