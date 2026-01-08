import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '@/lib/cart/actions';

export default function ProductCard({ product }) {
  const img = product.featuredImage;

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
          <div className='line-clamp-2 text-sm font-medium text-gray-900'>
            {product.title}
          </div>
          <div className='mt-2 text-sm text-gray-700'>
            {product.displayPrice}
          </div>
        </div>
      </Link>

      <div className='p-4 pt-0'>
        {product.firstVariantId ? (
          <form action={addToCart} className='mt-3 space-y-3'>
            <input
              type='hidden'
              name='merchandiseId'
              value={product.firstVariantId}
            />

            <div className='flex items-center justify-between gap-3'>
              <label
                htmlFor={`qty-${product.handle}`}
                className='text-sm text-gray-700'
              >
                Qty
              </label>

              <input
                id={`qty-${product.handle}`}
                name='quantity'
                type='number'
                min={1}
                max={99}
                defaultValue={1}
                inputMode='numeric'
                className='w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200'
              />
            </div>

            <button
              type='submit'
              className='w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800'
            >
              Add to cart
            </button>
          </form>
        ) : (
          <div className='mt-3 text-sm text-gray-500'>Unavailable</div>
        )}
      </div>
    </div>
  );
}
