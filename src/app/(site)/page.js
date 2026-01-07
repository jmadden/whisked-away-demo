import { Suspense } from 'react';
import Hero from '@/components/home/Hero';
import FeaturedProductsSection from '@/components/home/FeaturedProductsSection';
import FeaturedProductsSkeleton from '@/components/home/FeaturedProductsSkeleton';

export default function HomePage() {
  return (
    <main className='mx-auto max-w-6xl px-6'>
      <Hero />

      <section className='mt-12'>
        <Suspense fallback={<FeaturedProductsSkeleton />}>
          <FeaturedProductsSection />
        </Suspense>
      </section>
    </main>
  );
}
