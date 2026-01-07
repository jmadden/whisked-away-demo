// components/home/FeaturedProductsSection.js
import Link from 'next/link';
import { cacheLife, cacheTag } from 'next/cache';
import { getFeaturedProductsCached } from '@/lib/shopify/read'; // adjust import
import ProductCard from '@/components/shop/ProductCard'; // adjust import

export default async function FeaturedProductsSection() {
  'use cache: remote';
  cacheLife('max');
  cacheTag('products:featured');

  const products = await getFeaturedProductsCached({
    first: 4,
    query: 'tag:featured',
  });

  // if (!products?.length) return null;

  return (
    <div>
      <div className='flex items-baseline justify-between border-b-2 border-black pb-2 mb-6'>
        <h2 className='text-2xl font-bold uppercase tracking-tight text-black'>
          Featured Products
        </h2>
        <Link
          href='/products'
          className='text-sm font-medium text-black hover:underline'
        >
          View all &rarr;
        </Link>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8'>
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
