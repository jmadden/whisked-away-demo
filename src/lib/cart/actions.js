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

function throwIfUserErrors(payload, opName) {
  const errs = payload?.userErrors || [];
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'actions.js:18',
      message: 'throwIfUserErrors check',
      data: { opName, errorCount: errs.length, errors: errs },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
    }),
  }).catch(() => {});
  // #endregion
  if (errs.length) {
    throw new Error(`${opName} userErrors: ${JSON.stringify(errs)}`);
  }
}

async function getCartId() {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value || null;
}

async function setCartId(cartId) {
  const store = await cookies();
  store.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
}

async function clearCartId() {
  const store = await cookies();
  store.set(CART_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function getCart() {
  const cartId = await getCartId();
  if (!cartId) return null;

  const data = await shopifyFetch({
    query: CART_QUERY,
    variables: { id: cartId },
    cache: 'no-store',
  });

  // If Shopify returns null (expired/invalid cart), return null
  // (Cookie clearing must happen in Server Actions, not during render)
  if (!data?.cart) {
    return null;
  }

  // If cart has lines but all quantities are 0, the cart is in a corrupted state
  // Return null (Cookie clearing must happen in Server Actions, not during render)
  const hasLines = data.cart.lines?.nodes?.length > 0;
  const allQuantitiesZero =
    hasLines &&
    data.cart.lines.nodes.every(line => !line.quantity || line.quantity === 0);
  if (allQuantitiesZero && data.cart.totalQuantity === 0) {
    return null;
  }

  return data.cart;
}

async function getOrCreateCart() {
  const existing = await getCart();

  if (existing?.id) return existing;

  // If getCart returned null (invalid or corrupted cart), clear the cookie
  // This is safe here because getOrCreateCart is only called from Server Actions
  const cartId = await getCartId();
  if (cartId) {
    await clearCartId();
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'actions.js:75',
      message: 'Creating new cart',
      data: {},
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'B',
    }),
  }).catch(() => {});
  // #endregion
  const data = await shopifyFetch({
    query: CART_CREATE_MUTATION,
    variables: { input: {} },
    cache: 'no-store',
  });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'actions.js:81',
      message: 'After cartCreate',
      data: {
        hasData: !!data,
        hasCartCreate: !!data?.cartCreate,
        userErrors: data?.cartCreate?.userErrors,
        cartId: data?.cartCreate?.cart?.id,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'B',
    }),
  }).catch(() => {});
  // #endregion

  throwIfUserErrors(data?.cartCreate, 'cartCreate');

  const cart = data?.cartCreate?.cart;
  if (!cart?.id) throw new Error('cartCreate returned no cart id');

  await setCartId(cart.id);
  return cart;
}

export async function addToCart(formData) {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.js:90',
        message: 'addToCart entry',
        data: { hasFormData: !!formData },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    const merchandiseId = String(formData.get('merchandiseId') || '');
    const quantity = Number(formData.get('quantity') || 1);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.js:93',
        message: 'Form data extracted',
        data: {
          merchandiseId,
          quantity,
          isValidMerchandiseId: !!merchandiseId,
          isValidQuantity: Number.isFinite(quantity) && quantity >= 1,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
      }),
    }).catch(() => {});
    // #endregion

    if (!merchandiseId) throw new Error('Missing merchandiseId');
    if (!Number.isFinite(quantity) || quantity < 1)
      throw new Error('Invalid quantity');

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.js:99',
        message: 'Before getOrCreateCart',
        data: {},
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
    let cart = await getOrCreateCart();

    // Ensure cart is valid before proceeding
    if (!cart || !cart.id) {
      throw new Error('Invalid cart: cart is null or missing id');
    }

    // Remove all lines with quantity 0 before adding new items
    // (Shopify might merge new items with existing lines that have quantity 0)
    const zeroQuantityLines = (cart.lines?.nodes || []).filter(
      line => !line.quantity || line.quantity === 0
    );
    if (zeroQuantityLines.length > 0) {
      const removeData = await shopifyFetch({
        query: CART_LINES_REMOVE_MUTATION,
        variables: {
          cartId: cart.id,
          lineIds: zeroQuantityLines.map(line => line.id),
        },
        cache: 'no-store',
      });
      throwIfUserErrors(removeData?.cartLinesRemove, 'cartLinesRemove');
      // Update cart reference to the cleaned cart
      if (removeData?.cartLinesRemove?.cart) {
        cart = removeData.cartLinesRemove.cart;
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.js:100',
        message: 'After getOrCreateCart',
        data: { hasCart: !!cart, cartId: cart?.id },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion

    const linesPayload = [{ merchandiseId, quantity }];

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.js:246',
        message: 'Before shopifyFetch cartLinesAdd',
        data: { cartId: cart.id, merchandiseId, quantity, linesPayload },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion
    const data = await shopifyFetch({
      query: CART_LINES_ADD_MUTATION,
      variables: {
        cartId: cart.id,
        lines: linesPayload,
      },
      cache: 'no-store',
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.js:110',
        message: 'After shopifyFetch cartLinesAdd',
        data: {
          hasData: !!data,
          hasCartLinesAdd: !!data?.cartLinesAdd,
          userErrors: data?.cartLinesAdd?.userErrors,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion

    throwIfUserErrors(data?.cartLinesAdd, 'cartLinesAdd');

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.js:112',
        message: 'Before redirect',
        data: {},
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    revalidatePath('/cart');

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62013802-c757-464a-acf9-f65fc3aaf641', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.js:307',
        message: 'Calling redirect',
        data: { target: '/cart' },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    redirect('/cart');
  } catch (error) {
    throw error;
  }
}

export async function updateCartLine(formData) {
  const lineId = String(formData.get('lineId') || '');
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
  const lineId = String(formData.get('lineId') || '');
  if (!lineId) throw new Error('Missing lineId');

  const cartId = await getCartId();
  if (!cartId) return;

  const data = await shopifyFetch({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
    cache: 'no-store',
  });

  throwIfUserErrors(data?.cartLinesRemove, 'cartLinesRemove');

  revalidatePath('/cart');
}
