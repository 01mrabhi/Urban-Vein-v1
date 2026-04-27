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
  image_back?: string;
  category: string;
  badge?: string;
  actionType?: 'quick-add' | 'waitlist';
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Zoro Katana Tee',
    price: '₹599.00',
    description: '“Green Aura” — Inspired by the signature green energy and presence of Roronoa Zoro, the name represents calm intensity, inner strength, and silent dominance.',
    image: '/products/zoro_front.jpg',
    image_back: '/products/zoro_back.jpg',
    category: 'Graphic Series'
  },
  {
    id: '2',
    name: 'Panther Strike Tee',
    price: '₹549.00',
    description: 'Vein Beast: Short, bold, and brand-connected—suggests power running through you.',
    image: '/products/panther_front.jpg',
    image_back: '/products/panther_back.jpg',
    category: 'Limited Drops'
  },
  {
    id: '3',
    name: 'Anime White Variant',
    price: '₹549.00',
    description: 'Vow of Chaos: Feels ritualistic — like the character has embraced destruction as a path or purpose',
    image: '/products/white_anime_front.jpg',
    image_back: '/products/white_anime_back.jpg',
    category: 'Graphic Series'
  },
  {
    id: '4',
    name: 'Batman Series Tee',
    price: '₹599.00',
    description: 'The Knight Variant: Using "Variant" implies a unique design—it hints that this isn\'t just a generic shirt, but a curated art piece.',
    image: '/products/batman_front.jpg',
    image_back: '/products/batman_back.jpg',
    category: 'Oversized Collection'
  },
  {
    id: '5',
    name: 'CSK Edition Tee',
    price: '₹499.00',
    description: '“Roar of Champions” Captures the lion’s aggression and the winning legacy feel.',
    image: '/products/csk_front.jpg',
    image_back: '/products/csk_back.jpg',
    category: 'Essential Solids'
  }
];
