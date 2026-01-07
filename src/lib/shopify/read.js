// src/lib/shopify/read.js
import { shopifyFetch } from '@/lib/shopify/client';
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from '@/lib/shopify/queries';
import { kvGetJSON, kvSetJSON, kvDel } from '@/lib/cache/kv';

const FEATURED_KEY = first => `shopify:products:featured:first=${first}`;

const TTL_PRODUCTS_SECONDS = 60;
const TTL_PRODUCT_SECONDS = 300;
const TTL_FEATURED_SECONDS = 60 * 60 * 24; // 24h

function buildProductsCacheKey({
  first,
  after,
  last,
  before,
  query,
  sortKey,
  reverse,
}) {
  return (
    `shopify:products:` +
    `first=${first ?? ''}:after=${after ?? ''}:` +
    `last=${last ?? ''}:before=${before ?? ''}:` +
    `q=${query || ''}:sort=${sortKey || ''}:rev=${reverse ?? ''}`
  );
}

export async function getProductsCached({
  first = 12,
  after = null,
  last = null,
  before = null,
  query = null,
  sortKey = null,
  reverse = null,
} = {}) {
  const cacheKey = buildProductsCacheKey({
    first,
    after,
    last,
    before,
    query,
    sortKey,
    reverse,
  });

  const cached = await kvGetJSON(cacheKey);
  if (cached) return cached;

  // NOTE: shopifyFetch returns json.data (not { data: ... })
  const data = await shopifyFetch({
    query: PRODUCTS_QUERY,
    variables: { first, after, last, before, query, sortKey, reverse },
    cache: 'no-store',
  });

  const products = data?.products?.nodes ?? [];

  // ✅ Do not cache empty arrays
  if (products.length > 0) {
    await kvSetJSON(cacheKey, products, { ttlSeconds: TTL_PRODUCTS_SECONDS });
  }

  return products;
}

export async function getProductByHandleCached(handle) {
  const cacheKey = `shopify:product:handle=${handle}`;

  const cached = await kvGetJSON(cacheKey);
  if (cached) return cached;

  const data = await shopifyFetch({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    cache: 'no-store',
  });

  const product = data?.productByHandle ?? null;

  // ✅ Do not cache null
  if (product) {
    await kvSetJSON(cacheKey, product, { ttlSeconds: TTL_PRODUCT_SECONDS });
  }

  return product;
}

export async function getFeaturedProductsCached({ first = 4 } = {}) {
  const cacheKey = FEATURED_KEY(first);

  const cached = await kvGetJSON(cacheKey);
  if (cached) return cached;

  const data = await shopifyFetch({
    query: PRODUCTS_QUERY,
    variables: { first, query: 'tag:featured' },
    cache: 'no-store',
  });

  const products = data?.products?.nodes ?? [];

  // ✅ Do not cache empty arrays for long TTL caches
  if (products.length > 0) {
    await kvSetJSON(cacheKey, products, { ttlSeconds: TTL_FEATURED_SECONDS });
  }

  return products;
}

export async function invalidateFeaturedProductsCache({ first = 4 } = {}) {
  await kvDel(FEATURED_KEY(first));
}
