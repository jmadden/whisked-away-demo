// src/lib/shopify/client.js

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-07';

// Optional: allow explicit endpoint, otherwise derive it from domain + version.
const endpoint =
  process.env.SHOPIFY_STOREFRONT_API_ENDPOINT ||
  (domain
    ? `https://${String(domain)
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '')}/api/${apiVersion}/graphql.json`
    : null);

if (!domain) throw new Error('Missing SHOPIFY_STORE_DOMAIN');
if (!token) throw new Error('Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN');
if (!endpoint)
  throw new Error(
    'Missing SHOPIFY_STOREFRONT_API_ENDPOINT (or SHOPIFY_STORE_DOMAIN)'
  );

export async function shopifyFetch({ query, variables = {}, cache, next }) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    cache, // 'force-cache' | 'no-store'
    next, // { revalidate, tags }
  });

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}
