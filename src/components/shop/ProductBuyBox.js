// src/components/shop/ProductBuyBox.js
import Link from 'next/link';
import { Suspense } from 'react';
import AddToCartForm from '@/components/shop/AddToCartForm';

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

function SkeletonBuyBox() {
  return (
    <div className='mt-5'>
      <div className='h-10 w-full animate-pulse rounded-xl bg-gray-100' />
      <div className='mt-3 h-10 w-32 animate-pulse rounded-xl bg-gray-100' />
      <div className='mt-5 h-12 w-full animate-pulse rounded-xl bg-gray-100' />
    </div>
  );
}

export default function ProductBuyBox({ product }) {
  const price = product?.priceRange?.minVariantPrice;
  const displayPrice = price?.amount
    ? formatMoney(price.amount, price.currencyCode)
    : '';

  const tags = Array.isArray(product?.tags) ? product.tags.slice(0, 4) : [];

  return (
    <div className='card p-7'>
      <h1 className='text-2xl font-extrabold tracking-tight text-gray-900'>
        {product.title}
      </h1>

      <div className='mt-3 flex flex-wrap items-center gap-2'>
        {displayPrice ? (
          <div className='text-xl font-bold text-gray-900'>{displayPrice}</div>
        ) : null}

        <span className='rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900'>
          Kitchen tested
        </span>
      </div>

      {tags.length ? (
        <div className='mt-4 flex flex-wrap gap-2'>
          {tags.map(tag => (
            <span
              key={tag}
              className='rounded-full border border-amber-100 bg-white px-3 py-1 text-xs font-semibold text-amber-800'
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <Suspense fallback={<SkeletonBuyBox />}>
        <AddToCartForm product={product} />
      </Suspense>

      <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <Link
          href='/products'
          className='btn btn-secondary w-full text-center px-6 py-3 text-base font-semibold'
        >
          Keep shopping
        </Link>
        <Link
          href='/cart'
          className='btn btn-primary w-full text-center px-6 py-3 text-base font-semibold'
        >
          View cart
        </Link>
      </div>

      {/* Demo callout */}
      <div className='mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4'>
        <div className='text-sm font-semibold text-amber-900'>Demo notes</div>
        <ul className='mt-2 space-y-2 text-sm text-amber-900/90'>
          <li className='flex gap-2'>
            <span className='mt-1 inline-block h-2 w-2 rounded-full bg-amber-500' />
            Variant selection only appears when the product has real options.
          </li>
          <li className='flex gap-2'>
            <span className='mt-1 inline-block h-2 w-2 rounded-full bg-amber-500' />
            “Add to cart” uses Shopify’s Storefront API cart and an HttpOnly
            cookie for the cart ID.
          </li>
          <li className='flex gap-2'>
            <span className='mt-1 inline-block h-2 w-2 rounded-full bg-amber-500' />
            Checkout intentionally opens Shopify in a new tab to keep the demo
            free and lightweight.
          </li>
        </ul>
      </div>
    </div>
  );
}
