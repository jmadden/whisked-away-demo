// src/components/shop/ProductCard.js  (adjust path if yours is different)
import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '@/lib/cart/actions';

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

export default function ProductCard({ product }) {
  const img = product?.featuredImage;

  const firstVariantId =
    product?.firstVariantId || product?.variants?.nodes?.[0]?.id || null;

  const displayPrice =
    product?.displayPrice ||
    (product?.priceRange?.minVariantPrice?.amount
      ? formatMoney(
          product.priceRange.minVariantPrice.amount,
          product.priceRange.minVariantPrice.currencyCode
        )
      : '');

  return (
    <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md'>
      <Link href={`/products/${product.handle}`} className='group block'>
        <div className='relative aspect-4/3 w-full overflow-hidden bg-gray-100'>
          {img?.url ? (
            <Image
              src={img.url}
              alt={img.altText || product.title}
              fill
              className='object-cover transition duration-300 group-hover:scale-[1.02]'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
            />
          ) : (
            <div className='h-full w-full' />
          )}
        </div>

        <div className='p-4 pb-0'>
          <div className='line-clamp-2 text-sm font-semibold text-gray-900'>
            {product.title}
          </div>
          <div className='mt-2 text-sm text-gray-700'>{displayPrice}</div>
        </div>
      </Link>

      <div className='p-4 pt-3'>
        {firstVariantId ? (
          <form action={addToCart} className='flex items-center gap-2'>
            <input type='hidden' name='merchandiseId' value={firstVariantId} />

            <label className='sr-only' htmlFor={`qty-${product.handle}`}>
              Quantity
            </label>
            <input
              id={`qty-${product.handle}`}
              name='quantity'
              type='number'
              min={1}
              max={99}
              defaultValue={1}
              className='w-20 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200'
            />

            <button
              type='submit'
              className='flex-1 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800'
            >
              Add to cart
            </button>
          </form>
        ) : (
          <div className='text-sm text-gray-500'>Unavailable</div>
        )}
      </div>
    </div>
  );
}
