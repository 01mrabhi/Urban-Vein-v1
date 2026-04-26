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
          <ProductCard name="Phantom Tech Hoodie" price="₹2,999.00" image="/products/hoodi1-min.jpg" description="Triple-fleece structure with reinforced architectural stitching." />
          <ProductCard name="Cyber Graphic Tee" price="₹1,799.00" image="/products/Tshirt2-min.jpg" description="Limited edition high-density screen print with architectural aesthetics." />
          <ProductCard name="Urban Shield Hoodie" price="₹3,999.00" image="/products/hoodie4-min.jpg" description="Water-repellent finish with magnetic stash pockets. Final Drop." />
          <ProductCard name="Oversized Heavy Tee" price="₹1,499.00" image="/products/Tshirt1-min.jpg" description="Heavyweight 300GSM premium cotton, drop shoulder fit." />
        </div>
      </section>
    </main>
  );
}
