'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
  likedProductIds: string[];
  toggleLike: (productId: string) => void;
  isLiked: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedWishlist = localStorage.getItem('urbanvein_wishlist');
    if (savedWishlist) {
      try {
        setLikedProductIds(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist');
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('urbanvein_wishlist', JSON.stringify(likedProductIds));
    }
  }, [likedProductIds, isMounted]);

  const toggleLike = (productId: string) => {
    setLikedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isLiked = (productId: string) => likedProductIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ likedProductIds, toggleLike, isLiked }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
