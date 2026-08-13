import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { PRODUCTS } from '../../../lib/data';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return {
      title: 'Product Not Found | Urban Vein',
      description: 'The requested product could not be found in our streetwear archive.'
    };
  }

  // Construct absolute image URL for OpenGraph tags (WhatsApp, Instagram, Twitter)
  const imageUrl = product.image.startsWith('http')
    ? product.image
    : `https://www.urbanvein.in${product.image}`;

  return {
    title: `${product.name} — ${product.price}`,
    description: `${product.description} Available on Urban Vein with express PAN-India delivery.`,
    openGraph: {
      title: `${product.name} — ${product.price} | Urban Vein`,
      description: product.description,
      url: `https://www.urbanvein.in/products/${id}`,
      siteName: 'Urban Vein',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ${product.price}`,
      description: product.description,
      images: [imageUrl],
    },
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  return <ProductDetailClient productId={resolvedParams.id} />;
}
