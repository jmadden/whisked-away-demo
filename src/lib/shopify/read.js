// src/lib/shopify/read.js
import { shopifyFetch } from '@/lib/shopify/client';
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from '@/lib/shopify/queries';
import { kvGetJSON, kvSetJSON, kvDel } from '@/lib/cache/kv';

const TTL_PRODUCTS_SECONDS = 60;
const TTL_PRODUCT_SECONDS = 300;
const TTL_FEATURED_SECONDS = 60 * 60 * 24; // 24h

const FEATURED_KEY = first => `shopify:products:featured:first=${first}`;

function v(x, empty = 'NONE') {
  return x === null || x === undefined || x === '' ? empty : String(x);
}

function buildProductsCacheKey({
  first,
  after,
  last,
  before,
  query,
  sortKey,
  reverse,
}) {
  return [
    'shopify:products',
    `first=${v(first)}`,
    `after=${v(after)}`,
    `last=${v(last)}`,
    `before=${v(before)}`,
    `q=${v(query, 'NONE')}`,
    `sort=${v(sortKey, 'NONE')}`,
    `rev=${v(reverse, 'NONE')}`,
  ].join(':');
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

  const t0 = Date.now();
  const cached = await kvGetJSON(cacheKey);
  if (cached) {
    console.log('UPSTASH cache hit:', cacheKey, 'ms=', Date.now() - t0);
    return cached;
  }
  console.log('UPSTASH cache miss:', cacheKey, 'ms=', Date.now() - t0);

  const data = await shopifyFetch({
    query: PRODUCTS_QUERY,
    variables: { first, after, last, before, query, sortKey, reverse },
    cache: 'no-store',
  });

  const nodes = data?.products?.nodes ?? [];

  // Cache the full `data` object so pageInfo/cursors survive
  if (nodes.length > 0) {
    await kvSetJSON(cacheKey, data, { ttlSeconds: TTL_PRODUCTS_SECONDS });
  }

  return data;
}

export async function getProductByHandleCached(handle) {
  const cacheKey = `shopify:product:handle=${v(handle)}`;

  const t0 = Date.now();
  const cached = await kvGetJSON(cacheKey);
  if (cached) {
    console.log('UPSTASH cache hit:', cacheKey, 'ms=', Date.now() - t0);
    return cached;
  }
  console.log('UPSTASH cache miss:', cacheKey, 'ms=', Date.now() - t0);

  const data = await shopifyFetch({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    cache: 'no-store',
  });

  const product = data?.productByHandle ?? null;

  if (product) {
    await kvSetJSON(cacheKey, product, { ttlSeconds: TTL_PRODUCT_SECONDS });
  }

  return product;
}

export async function getFeaturedProductsCached({ first = 4 } = {}) {
  const cacheKey = FEATURED_KEY(first);

  const t0 = Date.now();
  const cached = await kvGetJSON(cacheKey);
  if (cached) {
    console.log('UPSTASH cache hit:', cacheKey, 'ms=', Date.now() - t0);
    return cached;
  }
  console.log('UPSTASH cache miss:', cacheKey, 'ms=', Date.now() - t0);

  const data = await shopifyFetch({
    query: PRODUCTS_QUERY,
    variables: { first, query: 'tag:featured' },
    cache: 'no-store',
  });

  const nodes = data?.products?.nodes ?? [];

  if (nodes.length > 0) {
    await kvSetJSON(cacheKey, data, { ttlSeconds: TTL_FEATURED_SECONDS });
  }

  return data;
}

export async function invalidateFeaturedProductsCache({ first = 4 } = {}) {
  await kvDel(FEATURED_KEY(first));
}
