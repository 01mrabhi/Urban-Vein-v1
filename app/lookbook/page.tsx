'use client';
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Lookbook from '../../components/Lookbook';

export default function LookbookPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-red-600/30">
      <Navbar />
      <div className="min-h-[70vh]">
        <Lookbook />
      </div>
      <Footer />
    </main>
  );
}
