// src/app/(site)/(shop)/products/page.js
import { Suspense } from 'react';
import ProductsPageContent from '@/app/(site)/(shop)/products/ProductsPageContent';

export default function ProductsPage({ searchParams }) {
  return (
    <main className='container-page'>
      <h1>Products</h1>

      <Suspense fallback={<div className='mt-8 muted'>Loading products…</div>}>
        <ProductsPageContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
