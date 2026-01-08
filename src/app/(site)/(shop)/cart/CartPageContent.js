// src/app/(site)/(shop)/cart/CartPageContent.js
import Link from 'next/link';
import Image from 'next/image';
import { getCart, updateCartLine, removeCartLine } from '@/lib/cart/actions';

function formatMoney(amount, currency) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(n);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
}

function lineTotal(line) {
  const amount = Number(line?.merchandise?.price?.amount || 0);
  const qty = Number(line?.quantity || 0);
  return amount * qty;
}

export default async function CartPageContent() {
  const cart = await getCart();

  if (!cart) {
    return (
      <div className='card p-10 text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100'>
          <svg
            className='h-6 w-6 text-gray-700'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6H19M7 13l12 0M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z'
            />
          </svg>
        </div>

        <div className='mt-4 text-base font-semibold text-gray-900'>
          Your cart is empty
        </div>
        <p className='muted mt-2'>Add something deliciously useful.</p>

        <div className='mt-6 flex justify-center gap-3'>
          <Link href='/products' className='btn btn-primary'>
            Browse products
          </Link>
          <Link href='/' className='btn btn-secondary'>
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const lines = cart?.lines?.nodes ?? [];
  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
      {/* Line items */}
      <div className='lg:col-span-2'>
        <div className='flex items-end justify-between'>
          <div>
            <div className='text-sm text-gray-600'>
              {lines.length} item{lines.length === 1 ? '' : 's'} in your cart
            </div>
          </div>

          <Link href='/products' className='btn btn-link'>
            Continue shopping
          </Link>
        </div>

        <div className='mt-4 card overflow-hidden'>
          {lines.length ? (
            <div className='divide-y divide-gray-200'>
              {lines.map(line => {
                const merchandise = line?.merchandise;
                const product = merchandise?.product;
                const img = product?.featuredImage;

                const unitPrice = formatMoney(
                  merchandise?.price?.amount,
                  merchandise?.price?.currencyCode
                );

                const totalForLine = formatMoney(
                  String(lineTotal(line)),
                  merchandise?.price?.currencyCode
                );

                const variantLabel =
                  merchandise?.title && merchandise.title !== 'Default Title'
                    ? merchandise.title
                    : null;

                return (
                  <div key={line.id} className='p-5 sm:p-6'>
                    <div className='flex gap-4'>
                      <Link
                        href={`/products/${product?.handle}`}
                        className='relative h-24 w-32 shrink-0 overflow-hidden rounded-2xl bg-gray-100'
                      >
                        {img?.url ? (
                          <Image
                            src={img.url}
                            alt={
                              img.altText || product?.title || 'Product image'
                            }
                            fill
                            className='object-cover'
                            sizes='128px'
                          />
                        ) : null}
                      </Link>

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='min-w-0'>
                            <Link
                              href={`/products/${product?.handle}`}
                              className='block truncate text-sm font-semibold text-gray-900 hover:underline'
                            >
                              {product?.title || 'Product'}
                            </Link>

                            {variantLabel ? (
                              <div className='mt-1 inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700'>
                                {variantLabel}
                              </div>
                            ) : (
                              <div className='mt-1 text-xs text-gray-500'>
                                Standard
                              </div>
                            )}

                            <div className='mt-3 flex items-center gap-3 text-sm'>
                              <div className='text-gray-600'>Unit</div>
                              <div className='font-medium text-gray-900'>
                                {unitPrice}
                              </div>
                            </div>
                          </div>

                          <div className='text-right'>
                            <div className='text-sm text-gray-600'>
                              Line total
                            </div>
                            <div className='text-base font-semibold text-gray-900'>
                              {totalForLine}
                            </div>
                          </div>
                        </div>

                        <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                          {/* Qty stepper using server action */}
                          <div className='flex items-center gap-3'>
                            <span className='text-sm text-gray-700'>Qty</span>

                            <div className='inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white'>
                              {/* Minus */}
                              <form action={updateCartLine}>
                                <input
                                  type='hidden'
                                  name='lineId'
                                  value={line.id}
                                />
                                <input
                                  type='hidden'
                                  name='quantity'
                                  value={Math.max(
                                    1,
                                    Number(line.quantity || 1) - 1
                                  )}
                                />
                                <button
                                  type='submit'
                                  className='px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50'
                                  disabled={Number(line.quantity || 1) <= 1}
                                  aria-label='Decrease quantity'
                                >
                                  −
                                </button>
                              </form>

                              <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                                {line.quantity}
                              </div>

                              {/* Plus */}
                              <form action={updateCartLine}>
                                <input
                                  type='hidden'
                                  name='lineId'
                                  value={line.id}
                                />
                                <input
                                  type='hidden'
                                  name='quantity'
                                  value={Math.min(
                                    99,
                                    Number(line.quantity || 1) + 1
                                  )}
                                />
                                <button
                                  type='submit'
                                  className='px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                                  aria-label='Increase quantity'
                                >
                                  +
                                </button>
                              </form>
                            </div>

                            {/* Direct edit (optional, still useful) */}
                            <form
                              action={updateCartLine}
                              className='flex items-center gap-2'
                            >
                              <input
                                type='hidden'
                                name='lineId'
                                value={line.id}
                              />
                              <input
                                name='quantity'
                                type='number'
                                min={1}
                                max={99}
                                defaultValue={line.quantity}
                                className='w-20 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200'
                              />
                              <button
                                type='submit'
                                className='btn btn-secondary'
                              >
                                Update
                              </button>
                            </form>
                          </div>

                          {/* Remove */}
                          <form action={removeCartLine}>
                            <input
                              type='hidden'
                              name='lineId'
                              value={line.id}
                            />
                            <button
                              type='submit'
                              className='inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 active:bg-gray-100'
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='p-10 text-center'>
              <div className='text-base font-semibold text-gray-900'>
                Your cart is empty
              </div>
              <p className='muted mt-2'>Add a product to get started.</p>
              <div className='mt-6'>
                <Link href='/products' className='btn btn-primary'>
                  Browse products
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className='muted mt-4'>
          Demo note: cart operations use Shopify’s headless cart API.
        </p>
      </div>

      {/* Summary */}
      <aside className='lg:col-span-1 lg:border-l lg:border-gray-200 lg:pl-8'>
        <div className='card p-6 sticky top-6'>
          <div className='flex items-center justify-between'>
            <div className='text-base font-semibold text-gray-900'>
              Order summary
            </div>
            <div className='text-sm text-gray-600'>
              {cart.totalQuantity} items
            </div>
          </div>

          <div className='mt-5 space-y-3 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-700'>Subtotal</span>
              <span className='text-gray-900'>
                {subtotal?.amount
                  ? formatMoney(subtotal.amount, subtotal.currencyCode)
                  : '—'}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-gray-700'>Estimated shipping</span>
              <span className='text-gray-900'>Calculated at checkout</span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-gray-700'>Taxes</span>
              <span className='text-gray-900'>Calculated at checkout</span>
            </div>

            <div className='pt-4 border-t border-gray-200 flex items-center justify-between'>
              <span className='text-base font-semibold text-gray-900'>
                Total
              </span>
              <span className='text-base font-semibold text-gray-900'>
                {total?.amount
                  ? formatMoney(total.amount, total.currencyCode)
                  : '—'}
              </span>
            </div>
          </div>

          <div className='mt-6 flex flex-col gap-3'>
            {cart.checkoutUrl ? (
              <a
                className='inline-flex items-center justify-center rounded-2xl bg-gray-900 px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-gray-800 hover:shadow-md active:bg-gray-900'
                href={cart.checkoutUrl}
                target='_blank'
                rel='noreferrer'
              >
                Checkout (Shopify)
              </a>
            ) : null}

            <Link
              className='inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-4 text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 hover:shadow-md active:bg-gray-100'
              href='/products'
            >
              Continue shopping
            </Link>

            <Link className='btn btn-link text-center' href='/'>
              Back to home
            </Link>
          </div>

          <p className='muted mt-4'>
            Demo note: checkout opens Shopify in a new tab.
          </p>
        </div>
      </aside>
    </div>
  );
}
