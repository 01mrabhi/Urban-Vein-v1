import type {Metadata} from 'next';
import {Inter, JetBrains_Mono} from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.urbanvein.in'),
  title: {
    default: 'Urban Vein | High-Grade Streetwear & Urban Aesthetics',
    template: '%s | Urban Vein'
  },
  description: 'Architecting the future of Indian streetwear. 100% Heavyweight Cotton Oversized Tees, Cyber Hoodies & Streetwear. Fast PAN-India Express Delivery.',
  keywords: ['urban vein', 'urbanvein', 'streetwear india', 'oversized t shirts', 'streetwear brand india', 'premium tshirts'],
  authors: [{ name: 'Urban Vein' }],
  creator: 'Urban Vein',
  publisher: 'Urban Vein',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Urban Vein | Streetwear Aesthetics',
    description: 'High-grade fabrics. Zero compromise. Discover the latest oversized drop with 1-click checkout & PAN-India express shipping.',
    url: 'https://www.urbanvein.in',
    siteName: 'Urban Vein',
    images: [
      {
        url: '/products/vk_forever_front.jpg',
        width: 1200,
        height: 1200,
        alt: 'Urban Vein - GOAT Virat Kohli Streetwear',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urban Vein | High-Grade Streetwear',
    description: 'Architecting the future of street aesthetics. Express PAN-India shipping.',
    images: ['/products/vk_forever_front.jpg'],
  },
};

import { ToastProvider } from '../context/ToastContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import CartSidebar from '../components/CartSidebar';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-zinc-950 text-white" suppressHydrationWarning>
        <WishlistProvider>
          <CartProvider>
            <ToastProvider>
              {children}
              <CartSidebar />
              <Analytics />
            </ToastProvider>
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
