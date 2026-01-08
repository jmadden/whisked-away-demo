// src/app/(site)/(shop)/products/page.js
import { Suspense } from 'react';
import ProductsPageContent from '@/app/(site)/(shop)/products/ProductsPageContent';
import LoadingProducts from './loading';

export default function ProductsPage({ searchParams }) {
  return (
    <main className='container-page'>
      <Suspense fallback={<LoadingProducts />}>
        <ProductsPageContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
