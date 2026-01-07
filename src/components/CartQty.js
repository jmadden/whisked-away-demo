// components/cart-qty.jsx (Server Component)
import { getCart } from '@/lib/cart/actions';

export async function CartQty() {
  const cart = await getCart();
  const qty = cart?.totalQuantity || 0;
  return <span className='text-gray-500'>({qty})</span>;
}
