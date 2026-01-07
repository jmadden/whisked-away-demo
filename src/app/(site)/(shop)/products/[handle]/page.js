// src/app/(site)/(shop)/products/[handle]/page.js
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addToCart } from '@/lib/cart/actions';
import { getProductByHandleCached } from '@/lib/shopify/read';

function formatMoney(amount, currency) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(n);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
}

export default async function ProductDetailPage({ params }) {
  // Next 16: params may be a Promise
  const { handle } = await params;

  const product = await getProductByHandleCached(handle);

  if (!product) notFound();

  const img = product.featuredImage;
  const price = formatMoney(
    product?.priceRange?.minVariantPrice?.amount,
    product?.priceRange?.minVariantPrice?.currencyCode
  );

  const firstVariant = product?.variants?.nodes?.[0] || null;
  const firstVariantId = firstVariant?.id || null;

  return (
    <main className='mx-auto max-w-6xl px-6 py-10'>
      <div className='mb-6'>
        <Link
          href='/products'
          className='text-sm text-gray-600 hover:underline'
        >
          ← Back to products
        </Link>
      </div>

      <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
        <div className='overflow-hidden rounded-2xl border border-gray-200 bg-gray-100'>
          <div className='relative aspect-[4/3] w-full'>
            {img?.url ? (
              <Image
                src={img.url}
                alt={img.altText || product.title}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, 50vw'
              />
            ) : null}
          </div>
        </div>

        <div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
            {product.title}
          </h1>

          {price ? (
            <div className='mt-3 text-xl font-semibold text-gray-900'>
              {price}
            </div>
          ) : null}

          {product?.description ? (
            <p className='mt-6 whitespace-pre-line text-sm leading-6 text-gray-700'>
              {product.description}
            </p>
          ) : null}

          <div className='mt-8'>
            {firstVariantId ? (
              <form action={addToCart} className='space-y-3'>
                <input
                  type='hidden'
                  name='merchandiseId'
                  value={firstVariantId}
                />
                <input type='hidden' name='quantity' value='1' />

                <button
                  type='submit'
                  className='w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800'
                >
                  Add to cart
                </button>

                <div className='text-xs text-gray-500'>
                  Adds: 1{' '}
                  {firstVariant?.title && firstVariant.title !== 'Default Title'
                    ? `${firstVariant.title} `
                    : ''}
                  {price ? `(${price})` : ''}
                </div>
              </form>
            ) : (
              <div className='rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600'>
                This item is currently unavailable.
              </div>
            )}
          </div>

          {Array.isArray(product?.tags) && product.tags.length ? (
            <div className='mt-8'>
              <div className='text-sm font-medium text-gray-900'>Tags</div>
              <div className='mt-2 flex flex-wrap gap-2'>
                {product.tags.map(t => (
                  <span
                    key={t}
                    className='rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700'
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
