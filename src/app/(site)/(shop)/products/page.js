// src/app/(site)/(shop)/products/page.js
import ProductGrid from '@/components/shop/ProductGrid';
import { getProductsCached } from '@/lib/shopify/read';

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

function escapeForShopifyQuery(value) {
  if (!value) return '';
  // basic escape to keep query syntax sane
  return value.replaceAll('"', '\\"');
}

function parseSort(sort) {
  switch (sort) {
    case 'title-asc':
      return { sortKey: 'TITLE', reverse: false };
    case 'title-desc':
      return { sortKey: 'TITLE', reverse: true };
    case 'price-asc':
      return { sortKey: 'PRICE', reverse: false };
    case 'price-desc':
      return { sortKey: 'PRICE', reverse: true };
    case 'newest':
      return { sortKey: 'CREATED_AT', reverse: true };
    default:
      return { sortKey: null, reverse: null };
  }
}

export default async function ProductsPage({ searchParams }) {
  // Next 16: searchParams may be a Promise
  const sp = await searchParams;

  const pageSize = 12;

  const q = typeof sp?.q === 'string' ? sp.q.trim() : '';
  const sort = typeof sp?.sort === 'string' ? sp.sort : '';

  const { sortKey, reverse } = parseSort(sort);

  // Simple search strategy: title match
  const query = q ? `title:*${escapeForShopifyQuery(q)}*` : null;

  const productsRaw = await getProductsCached({
    first: pageSize,
    query,
    sortKey,
    reverse,
  });

  // Your ProductCard expects displayPrice + firstVariantId
  const products = (productsRaw ?? []).map(p => ({
    ...p,
    displayPrice: formatMoney(
      p?.priceRange?.minVariantPrice?.amount,
      p?.priceRange?.minVariantPrice?.currencyCode
    ),
    firstVariantId: p?.variants?.nodes?.[0]?.id || null,
  }));

  return (
    <main className='mx-auto max-w-6xl px-6 py-10'>
      <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Products</h1>
          <p className='mt-2 text-gray-600'>
            Browse Whisked Away’s baking supplies.
          </p>
        </div>

        <form
          method='GET'
          action='/products'
          className='flex w-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:w-auto md:flex-row md:items-end'
        >
          <div className='min-w-[240px]'>
            <label className='text-sm font-medium text-gray-900'>Search</label>
            <input
              name='q'
              defaultValue={q}
              className='mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200'
              placeholder='whisk, flour, pan…'
            />
          </div>

          <div className='min-w-[200px]'>
            <label className='text-sm font-medium text-gray-900'>Sort</label>
            <select
              name='sort'
              defaultValue={sort}
              className='mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200'
            >
              <option value=''>Default</option>
              <option value='title-asc'>Title (A–Z)</option>
              <option value='title-desc'>Title (Z–A)</option>
              <option value='price-asc'>Price (Low–High)</option>
              <option value='price-desc'>Price (High–Low)</option>
              <option value='newest'>Newest</option>
            </select>
          </div>

          <button
            type='submit'
            className='inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800'
          >
            Apply
          </button>
        </form>
      </div>

      <div className='mt-8'>
        <ProductGrid products={products} />
      </div>
    </main>
  );
}
