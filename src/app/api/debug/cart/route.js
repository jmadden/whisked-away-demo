import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { shopifyFetch } from '@/lib/shopify/client';
import { CART_QUERY } from '@/lib/shopify/queries';

const CART_COOKIE = 'wa_cart_id';

export async function GET() {
  const store = await cookies();
  const cartId = store.get(CART_COOKIE)?.value || null;

  if (!cartId) {
    return NextResponse.json({ cartId: null, cart: null, reason: 'no_cookie' });
  }

  const data = await shopifyFetch({
    query: CART_QUERY,
    variables: { id: cartId },
    cache: 'no-store',
  });

  return NextResponse.json({
    cartId,
    hasCart: !!data?.cart,
    totalQuantity: data?.cart?.totalQuantity ?? null,
    lineCount: data?.cart?.lines?.nodes?.length ?? null,
    cart: data?.cart ?? null,
  });
}
