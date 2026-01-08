import { Suspense } from 'react';
import Hero from '@/components/home/Hero';
import FeaturedProductsSection from '@/components/home/FeaturedProductsSection';
import FeaturedProductsSkeleton from '@/components/home/FeaturedProductsSkeleton';
import { getFeaturedProductsCached } from '@/lib/shopify/read';

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

// Async Server Component INSIDE Suspense
async function FeaturedProductsRSC() {
  const data = await getFeaturedProductsCached({ first: 4 });
  const nodes = data?.products?.nodes ?? [];

  const featuredProducts = nodes.map(p => ({
    ...p,
    displayPrice: formatMoney(
      p?.priceRange?.minVariantPrice?.amount,
      p?.priceRange?.minVariantPrice?.currencyCode
    ),
    firstVariantId: p?.variants?.nodes?.[0]?.id || null,
  }));

  return <FeaturedProductsSection products={featuredProducts} />;
}

export default function HomePage() {
  return (
    <main className='mx-auto max-w-6xl px-6'>
      <Hero />

      <section className='mt-12'>
        <Suspense fallback={<FeaturedProductsSkeleton />}>
          <FeaturedProductsRSC />
        </Suspense>
      </section>
    </main>
  );
}
