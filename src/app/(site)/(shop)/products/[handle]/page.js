// src/app/(site)/(shop)/products/[handle]/page.js
import Image from 'next/image';
import Link from 'next/link';

import ProductBuyBox from '@/components/shop/ProductBuyBox';
import { getProductByHandleCached } from '@/lib/shopify/read';

export default async function ProductDetailPage({ params }) {
  const { handle } = await params;
  const product = await getProductByHandleCached(handle);

  if (!product) {
    return (
      <main className='container-page'>
        <div className='card p-10 text-center'>
          <div className='text-base font-semibold text-gray-900'>
            Product not found
          </div>
          <p className='muted mt-2'>That product handle doesn’t exist.</p>
          <div className='mt-6'>
            <Link href='/products' className='btn btn-primary'>
              Back to products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const img = product?.featuredImage;

  return (
    <main className='container-page'>
      <div className='mb-6'>
        <Link href='/products' className='btn btn-link'>
          ← Back to products
        </Link>
      </div>

      <div className='grid grid-cols-1 gap-10 lg:grid-cols-12'>
        <div className='lg:col-span-7'>
          <div className='card overflow-hidden'>
            <div className='relative aspect-square w-full bg-gradient-to-b from-amber-50 to-white'>
              {img?.url ? (
                <Image
                  src={img.url}
                  alt={img.altText || product.title}
                  fill
                  priority
                  className='object-cover'
                  sizes='(max-width: 1024px) 100vw, 60vw'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center text-sm text-gray-500'>
                  No image available
                </div>
              )}
            </div>
          </div>

          {product?.description ? (
            <section className='mt-8 card p-6'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Description
              </h2>
              <div className='mt-3 whitespace-pre-line text-sm leading-6 text-gray-700'>
                {product.description}
              </div>
            </section>
          ) : null}
        </div>

        <aside className='lg:col-span-5'>
          <div className='lg:sticky lg:top-24'>
            <ProductBuyBox product={product} />
          </div>
        </aside>
      </div>
    </main>
  );
}
