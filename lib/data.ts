export const CATEGORIES = [
  'Oversized Collection',
  'Graphic Series',
  'Essential Solids',
  'Limited Drops'
];

export type Product = {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
  badge?: string;
  actionType?: 'quick-add' | 'waitlist';
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Oversized Heavy Tee',
    price: '$85.00',
    description: 'Heavyweight 300GSM premium cotton, drop shoulder fit.',
    image: '/products/Tshirt1-min.jpg',
    category: 'Oversized Collection'
  },
  {
    id: '2',
    name: 'Cyber Graphic Tee',
    price: '$95.00',
    description: 'Limited edition high-density screen print with architectural aesthetics.',
    image: '/products/Tshirt2-min.jpg',
    category: 'Graphic Series'
  },
  {
    id: '3',
    name: 'Midnight Essential',
    price: '$65.00',
    description: 'Minimalist silhouette for everyday layering. Pre-shrunk silicone wash.',
    image: '/products/Tshirt3-min.jpg',
    category: 'Essential Solids'
  },
  {
    id: '4',
    name: 'Red Glow Limited',
    price: '$120.00',
    description: 'Numbered release. Only 50 units produced globally. Features reactive glow.',
    image: '/products/Tshirt4-min.jpg',
    category: 'Limited Drops',
    badge: 'RARE',
    actionType: 'waitlist'
  },
  {
    id: '5',
    name: 'Phantom Tech Hoodie',
    price: '$145.00',
    description: 'Triple-fleece structure with reinforced architectural stitching.',
    image: '/products/hoodi1-min.jpg',
    category: 'Oversized Collection'
  },
  {
    id: '6',
    name: 'Lava Series Hoodie',
    price: '$155.00',
    description: 'Thermal-reactive graphic on heavyweight 400GSM loopback terry.',
    image: '/products/hoodi2-min.jpg',
    category: 'Graphic Series'
  },
  {
    id: '7',
    name: 'Core Blue Variant',
    price: '$135.00',
    description: 'Brushed interior for maximum comfort in urban environments.',
    image: '/products/hoodi3-min.jpg',
    category: 'Essential Solids'
  },
  {
    id: '8',
    name: 'Urban Shield Hoodie',
    price: '$180.00',
    description: 'Water-repellent finish with magnetic stash pockets. Final Drop.',
    image: '/products/hoodie4-min.jpg',
    category: 'Limited Drops',
    badge: 'ELITE'
  }
];
