// src/app/api/webhooks/shopify/route.js
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { bumpCacheVersion } from '@/lib/cache/versions';
import { kvDel } from '@/lib/cache/kv';

function verifyShopifyHmac({ rawBody, hmacHeader, secret }) {
  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader || '');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req) {
  const rawBody = await req.text();

  const hmac = req.headers.get('x-shopify-hmac-sha256') || '';
  const topic = req.headers.get('x-shopify-topic') || 'unknown';
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    return new NextResponse('Missing SHOPIFY_WEBHOOK_SECRET', { status: 500 });
  }

  const ok = verifyShopifyHmac({ rawBody, hmacHeader: hmac, secret });
  if (!ok) {
    return new NextResponse('Invalid webhook signature', { status: 401 });
  }

  let payload = null;
  try {
    payload = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    payload = null;
  }

  // ✅ Invalidate all product-list caches instantly (paging/filter/sort)
  await bumpCacheVersion('products');

  // ✅ Invalidate featured list caches instantly
  await bumpCacheVersion('featured');

  // ✅ Invalidate the specific product detail cache (if we have a handle)
  const handle = payload?.handle;
  if (typeof handle === 'string' && handle.length) {
    await kvDel(`shopify:product:handle=${handle}`);
  }

  return NextResponse.json({ ok: true, topic });
}
