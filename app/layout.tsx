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
  title: 'UrbanVein | Street Aesthetics',
  description: 'Architecting the future of street aesthetics. High-grade fabrics. Zero Compromise.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

import { ToastProvider } from '../context/ToastContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import CartSidebar from '../components/CartSidebar';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-zinc-950 text-white" suppressHydrationWarning>
        <WishlistProvider>
          <CartProvider>
            <ToastProvider>
              {children}
              <CartSidebar />
            </ToastProvider>
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
