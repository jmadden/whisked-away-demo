// src/components/home/FeaturedProductsSection.js
import ProductCard from '@/components/shop/ProductCard';
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

export default async function FeaturedProductsSection() {
  const data = await getFeaturedProductsCached({ first: 4 });
  const nodes = data?.products?.nodes ?? [];

  const products = nodes.map(p => ({
    ...p,
    displayPrice: formatMoney(
      p?.priceRange?.minVariantPrice?.amount,
      p?.priceRange?.minVariantPrice?.currencyCode
    ),
    firstVariantId: p?.variants?.nodes?.[0]?.id || null,
  }));

  if (!products.length) {
    return (
      <div className='card p-6'>
        <div className='text-sm font-medium text-gray-900'>
          Featured products
        </div>
        <p className='muted mt-2'>No featured products found yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-4 flex items-end justify-between'>
        <h2 className='text-xl font-semibold text-gray-900'>Featured</h2>
      </div>

      <div className='grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
