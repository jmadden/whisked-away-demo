// src/app/api/shopify/route.js (or wherever yours lives)
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

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
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    return new NextResponse('Missing SHOPIFY_WEBHOOK_SECRET', { status: 500 });
  }

  const ok = verifyShopifyHmac({ rawBody, hmacHeader: hmac, secret });
  if (!ok)
    return new NextResponse('Invalid webhook signature', { status: 401 });

  // Invalidate caches for next visit (stale-while-revalidate)
  revalidateTag('shopify:products', 'max');
  revalidateTag('shopify:featured', 'max');

  return NextResponse.json({ ok: true });
}
