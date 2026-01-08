// src/lib/shopify/read.js
import { cacheLife, cacheTag } from 'next/cache';
import { shopifyFetch } from '@/lib/shopify/client';
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from '@/lib/shopify/queries';

export async function getProductsCached({
  first = 12,
  after = null,
  last = null,
  before = null,
  query = null,
  sortKey = null,
  reverse = null,
} = {}) {
  'use cache';

  // Cache "forever" until webhook invalidates tags
  cacheLife('max');
  cacheTag('shopify:products');

  const data = await shopifyFetch({
    query: PRODUCTS_QUERY,
    variables: { first, after, last, before, query, sortKey, reverse },
    cache: 'force-cache',
    next: { tags: ['shopify:products'] },
  });

  return data;
}

export async function getProductByHandleCached(handle) {
  'use cache';

  cacheLife('max');
  cacheTag('shopify:products');
  cacheTag(`shopify:product:${handle}`);

  const data = await shopifyFetch({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    cache: 'force-cache',
    next: { tags: ['shopify:products', `shopify:product:${handle}`] },
  });

  return data?.productByHandle ?? null;
}

export async function getFeaturedProductsCached({ first = 4 } = {}) {
  'use cache';

  cacheLife('max');
  cacheTag('shopify:featured');

  const data = await shopifyFetch({
    query: PRODUCTS_QUERY,
    variables: { first, query: 'tag:featured' },
    cache: 'force-cache',
    next: { tags: ['shopify:featured'] },
  });

  return data;
}
