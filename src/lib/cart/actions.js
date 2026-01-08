// src/lib/cart/actions.js
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { shopifyFetch } from '@/lib/shopify/client';
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from '@/lib/shopify/queries';

const CART_COOKIE = 'wa_cart_id';
const CART_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function formatUserErrors(userErrors = []) {
  return userErrors
    .map(e => {
      const field = Array.isArray(e.field) ? e.field.join('.') : '';
      const prefix = field ? `${field}: ` : '';
      return `${prefix}${e.message}`;
    })
    .join(' | ');
}

function throwIfUserErrors(payload, opName) {
  const errs = payload?.userErrors || [];
  if (errs.length) {
    throw new Error(`${opName} userErrors: ${formatUserErrors(errs)}`);
  }
}

async function getCookieStore() {
  // In Next 16 dynamic APIs can be async
  return await cookies();
}

async function getCartId() {
  const store = await getCookieStore();
  return store.get(CART_COOKIE)?.value || null;
}

async function setCartId(cartId) {
  const store = await getCookieStore();
  store.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CART_MAX_AGE,
  });
}

async function clearCartId() {
  const store = await getCookieStore();
  store.set(CART_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Read cart for rendering.
 * Important: do not mutate cookies here.
 */
export async function getCart() {
  const cartId = await getCartId();
  if (!cartId) return null;

  const data = await shopifyFetch({
    query: CART_QUERY,
    variables: { id: cartId },
    cache: 'no-store',
  });

  // Cart can expire or become invalid
  if (!data?.cart) return null;

  // Defensive: sometimes carts can end up in a weird state with zero quantities
  const hasLines = (data.cart.lines?.nodes?.length || 0) > 0;
  const allQuantitiesZero =
    hasLines &&
    data.cart.lines.nodes.every(line => !line.quantity || line.quantity === 0);

  if (allQuantitiesZero && data.cart.totalQuantity === 0) return null;

  return data.cart;
}

async function createCart() {
  const data = await shopifyFetch({
    query: CART_CREATE_MUTATION,
    variables: { input: {} },
    cache: 'no-store',
  });

  throwIfUserErrors(data?.cartCreate, 'cartCreate');

  const cart = data?.cartCreate?.cart;
  if (!cart?.id) throw new Error('cartCreate returned no cart id');

  await setCartId(cart.id);
  return cart;
}

async function getOrCreateCart() {
  const existing = await getCart();
  if (existing?.id) return existing;

  // If there was a cookie but Shopify returned null, clear it
  const cartId = await getCartId();
  if (cartId) await clearCartId();

  return await createCart();
}

/**
 * Server Action: add a line item to the cart then redirect to /cart
 */
export async function addToCart(formData) {
  const merchandiseId = String(formData.get('merchandiseId') || '').trim();
  const quantityRaw = formData.get('quantity');
  const quantity = Number(quantityRaw || 1);

  if (!merchandiseId) throw new Error('Missing merchandiseId');
  if (!Number.isFinite(quantity) || quantity < 1)
    throw new Error('Invalid quantity');

  let cart = await getOrCreateCart();
  if (!cart?.id) throw new Error('Invalid cart: missing id');

  // Remove any zero-quantity lines defensively
  const zeroQuantityLines = (cart.lines?.nodes || []).filter(
    line => !line.quantity || line.quantity === 0
  );

  if (zeroQuantityLines.length > 0) {
    const removeData = await shopifyFetch({
      query: CART_LINES_REMOVE_MUTATION,
      variables: { cartId: cart.id, lineIds: zeroQuantityLines.map(l => l.id) },
      cache: 'no-store',
    });

    throwIfUserErrors(removeData?.cartLinesRemove, 'cartLinesRemove');

    if (removeData?.cartLinesRemove?.cart?.id) {
      cart = removeData.cartLinesRemove.cart;
      // Persist in case Shopify returned a different cart id (rare, but safe)
      await setCartId(cart.id);
    }
  }

  const addData = await shopifyFetch({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId: cart.id, lines: [{ merchandiseId, quantity }] },
    cache: 'no-store',
  });

  throwIfUserErrors(addData?.cartLinesAdd, 'cartLinesAdd');

  const updatedCart = addData?.cartLinesAdd?.cart;
  if (!updatedCart?.id) {
    // If Shopify gave us nothing back, reset cookie to avoid a stuck cart
    await clearCartId();
    throw new Error('cartLinesAdd returned no cart');
  }

  // IMPORTANT: set cookie before redirect (redirect throws internally)
  await setCartId(updatedCart.id);

  revalidatePath('/cart');
  redirect('/cart'); // This becomes the 303 you see, expected
}

export async function updateCartLine(formData) {
  const lineId = String(formData.get('lineId') || '').trim();
  const quantity = Number(formData.get('quantity') || 1);

  if (!lineId) throw new Error('Missing lineId');
  if (!Number.isFinite(quantity) || quantity < 1)
    throw new Error('Invalid quantity');

  const cartId = await getCartId();
  if (!cartId) return;

  const data = await shopifyFetch({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
    cache: 'no-store',
  });

  throwIfUserErrors(data?.cartLinesUpdate, 'cartLinesUpdate');

  revalidatePath('/cart');
}

export async function removeCartLine(formData) {
  const lineId = String(formData.get('lineId') || '').trim();
  if (!lineId) throw new Error('Missing lineId');

  const cartId = await getCartId();
  if (!cartId) return;

  const data = await shopifyFetch({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
    cache: 'no-store',
  });

  throwIfUserErrors(data?.cartLinesRemove, 'cartLinesRemove');

  // If cart becomes invalid after removal, clear cookie
  if (!data?.cartLinesRemove?.cart?.id) {
    await clearCartId();
  }

  revalidatePath('/cart');
}
