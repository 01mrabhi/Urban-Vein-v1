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
    id: '5',
    name: 'CSK Edition Tee',
    price: '₹549.00',
    description: '“Roar of Champions” Captures the lion’s aggression and the winning legacy feel.',
    image: '/products/csk_front.jpg',
    image_back: '/products/csk_back.jpg',
    category: 'Limited Drops'
  },
  {
    id: '2',
    name: 'Panther Strike Tee',
    price: '₹549.00',
    description: 'Vein Beast: Short, bold, and brand-connected—suggests power running through you.',
    image: '/products/panther_front.jpg',
    image_back: '/products/panther_back.jpg',
    category: 'Essential Solids'
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
    id: '1',
    name: 'Zoro Katana Tee',
    price: '₹599.00',
    description: '“Green Aura” — Inspired by the signature green energy and presence of Roronoa Zoro, the name represents calm intensity, inner strength, and silent dominance.',
    image: '/products/zoro_front.jpg',
    image_back: '/products/zoro_back.jpg',
    category: 'Graphic Series'
  },
  {
    id: '6',
    name: 'GOAT Tee',
    price: '₹500.00',
    description: 'More than a number. It’s a legacy of grit, passion, and chasing down the impossible. Rep the king with the Forever 18 tee.',
    image: '/products/vk_forever_front.jpg',
    image_back: '/products/vk_forever_back.jpg',
    category: 'Graphic Series'
  },
  {
    id: '7',
    name: 'Thala Tshirt',
    price: '₹500.00',
    description: '"Thala for a reason." The man. The myth. The jersey. Level up your match-day fit or your everyday streetwear with our exclusive MS Dhoni tribute tee. Click the link to secure yours before they sell out!',
    image: '/products/dhoni_front.jpg',
    image_back: '/products/dhoni_back.jpg',
    category: 'Graphic Series'
  },
  {
    id: '8',
    name: 'Thala Last Ride',
    price: '₹500.00',
    description: 'Defending the Legacy. Built for the fans who know that some legends never fade. This premium heavy-print tee is designed for the true CSK and Dhoni loyalists. Sleek, sharp, and unmistakably Thala. Drop a if you’re rocking the 7 this season. Available now!',
    image: '/products/dhoni_white_front.jpg',
    image_back: '/products/dhoni_white_back.jpg',
    category: 'Oversized Collection'
  },
  {
    id: '9',
    name: 'Play Bold Tee',
    price: '₹500.00',
    description: 'Form is temporary, but the love for the Challengers is permanent. Rep the red and gold in style this season.',
    image: '/products/rcb_design.jpg',
    category: 'Limited Drops'
  }
];
