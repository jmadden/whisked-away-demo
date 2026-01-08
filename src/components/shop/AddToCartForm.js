// src/components/shop/AddToCartForm.js
'use client';

import { useMemo, useState } from 'react';
import { addToCart } from '@/lib/cart/actions';

export default function AddToCartForm({ product }) {
  const variants = product?.variants?.nodes ?? [];

  const hasRealOptions = useMemo(() => {
    const opts = product?.options ?? [];
    return opts.some(o => (o?.values?.length ?? 0) > 1) && variants.length > 1;
  }, [product, variants.length]);

  const defaultVariantId = variants?.[0]?.id || '';
  const [variantId, setVariantId] = useState(defaultVariantId);
  const [qty, setQty] = useState(1);

  if (!defaultVariantId) {
    return <div className='text-sm text-gray-500'>Unavailable</div>;
  }

  return (
    <form action={addToCart} className='mt-5'>
      <input type='hidden' name='merchandiseId' value={variantId} />

      <div className='grid grid-cols-1 gap-5 sm:grid-cols-3 sm:items-end'>
        {/* Variant */}
        <div className='sm:col-span-2'>
          {hasRealOptions ? (
            <>
              <label className='text-sm font-semibold text-gray-900'>
                Variant
              </label>
              <select
                className='input mt-2'
                value={variantId}
                onChange={e => setVariantId(e.target.value)}
              >
                {variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <div className='text-sm font-semibold text-gray-900'>
                {product?.title}
              </div>
              <div className='mt-1 text-sm text-gray-600'>
                {variants?.[0]?.title && variants[0].title !== 'Default Title'
                  ? variants[0].title
                  : 'Standard'}
              </div>
            </>
          )}
        </div>

        {/* Qty */}
        <div>
          <div className='flex items-center justify-between'>
            <label className='text-sm font-semibold text-gray-900'>Qty</label>
            <span className='text-xs text-gray-500'>1–99</span>
          </div>

          <input
            name='quantity'
            type='number'
            min={1}
            max={99}
            value={qty}
            onChange={e => setQty(Number(e.target.value || 1))}
            className='mt-2 w-full rounded-xl border-2 border-gray-200 bg-amber-50 px-4 py-3 text-center text-base font-semibold text-gray-900 shadow-sm outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200'
          />
        </div>
      </div>

      <button
        type='submit'
        className='btn btn-primary mt-5 w-full px-6 py-3 text-base font-semibold'
      >
        Add to cart
      </button>

      <p className='muted mt-3 text-xs'>
        Adds the selected variant to your Shopify cart.
      </p>
    </form>
  );
}
