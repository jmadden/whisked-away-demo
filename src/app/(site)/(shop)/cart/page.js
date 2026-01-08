// src/app/(site)/(shop)/cart/page.js
import { Suspense } from 'react';
import CartPageContent from './CartPageContent';
import CartSkeleton from './CartSkeleton';

export default function CartPage() {
  return (
    <main className='container-page'>
      <div className='flex items-end justify-between'>
        <div>
          <p className='muted mt-2'>Review your items before checkout.</p>
        </div>
      </div>

      <div className='mt-8'>
        <Suspense fallback={<CartSkeleton />}>
          <CartPageContent />
        </Suspense>
      </div>
    </main>
  );
}
