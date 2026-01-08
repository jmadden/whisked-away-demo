// src/app/(site)/(shop)/products/ProductsPageContent.js
import Link from 'next/link';
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

function quoteIfNeeded(value) {
  if (!value) return '';
  return /[\s:]/.test(value) ? `"${value.replaceAll('"', '\\"')}"` : value;
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

function buildShopifyQuery({ q, type, inStock }) {
  const parts = [];
  if (q) parts.push(q);
  if (type) parts.push(`product_type:${quoteIfNeeded(type)}`);
  if (inStock) parts.push('available_for_sale:true');
  return parts.length ? parts.join(' AND ') : null;
}

function chip(label, value) {
  if (!value) return null;
  return (
    <span className='inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700'>
      <span className='font-medium text-gray-900'>{label}</span>
      <span className='text-gray-600'>{value}</span>
    </span>
  );
}

export default async function ProductsPageContent({ searchParams }) {
  const sp = await searchParams;

  const pageSize = 12;

  const after = typeof sp?.after === 'string' ? sp.after : null;
  const before = typeof sp?.before === 'string' ? sp.before : null;

  // Filters
  const q = typeof sp?.q === 'string' ? sp.q.trim() : '';
  const type = typeof sp?.type === 'string' ? sp.type.trim() : '';
  const inStock = sp?.inStock === '1';

  // Sorting
  const sort = typeof sp?.sort === 'string' ? sp.sort : '';
  const { sortKey, reverse } = parseSort(sort);

  const query = buildShopifyQuery({ q, type, inStock });

  // Paging vars
  const pagingVars = before
    ? { first: null, after: null, last: pageSize, before }
    : { first: pageSize, after, last: null, before: null };

  const result = await getProductsCached({
    ...pagingVars,
    query,
    sortKey,
    reverse,
  });

  const conn = Array.isArray(result)
    ? null
    : result?.products
    ? result.products
    : result;

  const nodes = Array.isArray(result) ? result : conn?.nodes ?? [];
  const pageInfo = conn?.pageInfo ?? {};

  const products = (nodes ?? []).map(p => ({
    ...p,
    displayPrice: formatMoney(
      p?.priceRange?.minVariantPrice?.amount,
      p?.priceRange?.minVariantPrice?.currencyCode
    ),
    firstVariantId: p?.variants?.nodes?.[0]?.id || null,
  }));

  const { hasNextPage, endCursor, hasPreviousPage, startCursor } = pageInfo;

  // Preserve filters in pagination URLs
  const baseParams = new URLSearchParams();
  if (q) baseParams.set('q', q);
  if (type) baseParams.set('type', type);
  if (inStock) baseParams.set('inStock', '1');
  if (sort) baseParams.set('sort', sort);

  const nextHref =
    hasNextPage && endCursor
      ? `/products?${new URLSearchParams({
          ...Object.fromEntries(baseParams),
          after: endCursor,
        }).toString()}`
      : null;

  const prevHref =
    hasPreviousPage && startCursor
      ? `/products?${new URLSearchParams({
          ...Object.fromEntries(baseParams),
          before: startCursor,
        }).toString()}`
      : null;

  const anyFilters = Boolean(q || type || inStock || sort);

  return (
    <>
      <div className='mt-6 flex flex-col gap-6'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-2xl font-semibold tracking-tight text-gray-900'>
              Products
            </h2>
            <p className='muted mt-2'>
              Find tools and supplies for your next bake.
            </p>
          </div>

          {anyFilters ? (
            <div className='flex flex-wrap gap-2'>
              {chip('Search', q)}
              {chip('Type', type)}
              {chip('Stock', inStock ? 'In stock' : '')}
              {chip(
                'Sort',
                sort
                  ? {
                      'title-asc': 'Title A–Z',
                      'title-desc': 'Title Z–A',
                      'price-asc': 'Price Low–High',
                      'price-desc': 'Price High–Low',
                      newest: 'Newest',
                    }[sort] || sort
                  : ''
              )}
            </div>
          ) : null}
        </div>

        <form method='GET' action='/products' className='card p-4 sm:p-5'>
          {/* Top row: Search + action buttons */}
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <div className='flex-1'>
              <label className='text-medium font-medium text-gray-900 pr-5 '>
                Search
              </label>
              <input
                name='q'
                defaultValue={q}
                className='input mt-2'
                placeholder='Search: whisk, flour, pan…'
              />
            </div>

            <div className='flex gap-2 sm:pt-6'>
              <button
                className='btn btn-primary w-full sm:w-auto'
                type='submit'
              >
                Apply
              </button>
              <Link
                className='btn btn-secondary w-full sm:w-auto'
                href='/products'
              >
                Reset
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className='mt-4 border-t border-gray-200' />

          {/* Advanced row */}
          <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div>
              <label className='text-md font-medium text-gray-900 pr-5'>
                Type
              </label>
              <input
                name='type'
                defaultValue={type}
                className='input mt-2'
                placeholder='Tools, Ingredients, …'
              />
              <p className='mt-2 text-md text-gray-500'>
                Matches Shopify <span className='font-mono'>product_type</span>
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-900'>Sort</label>
              <select name='sort' defaultValue={sort} className='input mt-2'>
                <option value=''>Default</option>
                <option value='title-asc'>Title (A–Z)</option>
                <option value='title-desc'>Title (Z–A)</option>
                <option value='price-asc'>Price (Low–High)</option>
                <option value='price-desc'>Price (High–Low)</option>
                <option value='newest'>Newest</option>
              </select>
              <p className='mt-2 text-xs text-gray-500'>
                Sorts the Shopify connection
              </p>
            </div>

            <div className='flex items-end'>
              <label className='flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700'>
                <input
                  type='checkbox'
                  name='inStock'
                  value='1'
                  defaultChecked={inStock}
                  className='h-4 w-4'
                />
                In stock only
              </label>
            </div>

            <div className='flex items-end'>
              <div className='w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3'>
                <div className='text-xs font-medium text-gray-900'>Tip</div>
                <div className='mt-1 text-xs text-gray-600'>
                  Try <span className='font-mono'>type=Tools</span> or search{' '}
                  <span className='font-mono'>whisk</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className='mt-8'>
        <ProductGrid products={products} />
      </div>

      <div className='mt-12 flex items-center justify-center gap-4 pb-10'>
        {prevHref ? (
          <Link
            href={prevHref}
            className='inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 hover:shadow-md active:bg-gray-100'
          >
            ← Previous
          </Link>
        ) : (
          <span className='inline-flex cursor-not-allowed items-center justify-center rounded-2xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-400 shadow-sm opacity-60'>
            ← Previous
          </span>
        )}

        {nextHref ? (
          <Link
            href={nextHref}
            className='inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 hover:shadow-md active:bg-gray-100'
          >
            Next →
          </Link>
        ) : (
          <span className='inline-flex cursor-not-allowed items-center justify-center rounded-2xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-400 shadow-sm opacity-60'>
            Next →
          </span>
        )}
      </div>
    </>
  );
}
