import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// No `export const runtime = ...` when cacheComponents is enabled.

function toBase64(bytes) {
  // Works in Node and Edge
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  // eslint-disable-next-line no-undef
  return btoa(binary);
}

function timingSafeEqual(aBytes, bBytes) {
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}

async function hmacSha256Base64({ secret, message }) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return toBase64(new Uint8Array(sig));
}

export async function POST(req) {
  const rawBody = await req.text();

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse('Missing SHOPIFY_WEBHOOK_SECRET', { status: 500 });
  }

  const hmacHeader = req.headers.get('x-shopify-hmac-sha256') || '';
  if (!hmacHeader) {
    return new NextResponse('Missing Shopify HMAC header', { status: 401 });
  }

  const computed = await hmacSha256Base64({ secret, message: rawBody });

  // Constant-time compare
  const a = new TextEncoder().encode(computed);
  const b = new TextEncoder().encode(hmacHeader);
  if (!timingSafeEqual(a, b)) {
    return new NextResponse('Invalid webhook signature', { status: 401 });
  }

  // ✅ Invalidate Next.js cache tags
  revalidateTag('shopify:products', 'max');
  revalidateTag('shopify:featured', 'max');

  return NextResponse.json({ ok: true });
}
