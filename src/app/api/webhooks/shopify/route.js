import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { invalidateFeaturedProductsCache } from '@/lib/shopify/read';

function verifyShopifyHmac({ rawBody, hmacHeader, secret }) {
  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  // timingSafeEqual throws if buffer lengths differ
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader || '');
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

export async function POST(req) {
  const rawBody = await req.text();

  const hmac = req.headers.get('x-shopify-hmac-sha256') || '';
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret)
    return new NextResponse('Missing SHOPIFY_WEBHOOK_SECRET', { status: 500 });

  const ok = verifyShopifyHmac({ rawBody, hmacHeader: hmac, secret });
  if (!ok)
    return new NextResponse('Invalid webhook signature', { status: 401 });

  // Any product change could add/remove the "featured" tag, so invalidate the list.
  await invalidateFeaturedProductsCache({ first: 4 });
  revalidateTag('products:featured');

  return NextResponse.json({ ok: true });
}
