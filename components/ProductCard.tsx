'use client';
import React from 'react';
import { Heart, Plus, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  badge?: string;
  actionType?: 'quick-add' | 'waitlist';
  onClick?: () => void;
}


export default function ProductCard({ 
  name, 
  price, 
  image, 
  description, 
  badge, 
  actionType = 'quick-add',
  onClick
}: ProductCardProps) {
  const { showToast } = useToast();
  const { addToCart } = useCart();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-zinc-900 mb-6 border border-zinc-900 hover:border-zinc-800 transition-colors">
        {/* Badge */}
        {badge && (
          <div className="absolute top-6 left-6 z-10">
            <span className="bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
              {badge}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button className="absolute top-6 right-6 z-10 w-10 h-10 bg-zinc-950/80 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black hover:scale-110">
          <Heart size={18} />
        </button>

        {/* Product Image */}
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />

        {/* Action Button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const numericPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
              addToCart({
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name,
                price: numericPrice,
                image,
                size: 'L',
                color: 'Phantom Black',
                quantity: 1,
                category: 'Quick Add'
              });
              showToast(`Added ${name} to your bag`, 'success');
            }}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
              actionType === 'waitlist' 
              ? 'bg-white text-black hover:bg-zinc-200' 
              : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {actionType === 'waitlist' ? 'Join Waitlist' : (
              <>Quick Add <Plus size={14} /></>
            )}
          </button>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <div className="space-y-2 px-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-red-600 transition-colors">{name}</h3>
          <span className="text-sm font-black tracking-tighter text-red-600">{price}</span>
        </div>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
