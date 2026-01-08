// src/app/(site)/(shop)/products/[handle]/page.js
import { Suspense } from 'react';
import ProductDetailContent from './ProductDetailContent';

export default function ProductDetailPage({ params }) {
  return (
    <main className='container-page'>
      <Suspense fallback={<div className='muted'>Loading product…</div>}>
        <ProductDetailContent params={params} />
      </Suspense>
    </main>
  );
}
