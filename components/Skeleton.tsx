'use client';
import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden bg-zinc-900/50 rounded-2xl ${className}`}>
      <motion.div
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      />
    </div>
  );
}

export function ImageWithSkeleton({ src, alt, className, imageClassName }: { 
  src: string; 
  alt: string; 
  className?: string;
  imageClassName?: string;
}) {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && <Skeleton className="absolute inset-0 w-full h-full z-10" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`${imageClassName} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      />
    </div>
  );
}
