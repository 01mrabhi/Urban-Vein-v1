export const CATEGORIES = [
  'Oversized Collection',
  'Graphic Series',
  'Essential Solids',
  'Limited Drops'
];

export type Product = {
  id: string; // Wait, supabase uses uuid for id, but we mapped original_id. Let's keep original_id as a field or just map it to id.
  original_id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
  badge?: string;
  actionType?: 'quick-add' | 'waitlist';
};
