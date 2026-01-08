// src/components/home/FeaturedProductsSection.js
import ProductCard from '@/components/shop/ProductCard';

function normalizeProducts(input) {
  if (Array.isArray(input)) return input;

  // If caller passed the whole Shopify `data` object:
  if (input?.products?.nodes && Array.isArray(input.products.nodes)) {
    return input.products.nodes;
  }

  // If caller passed the connection directly:
  if (input?.nodes && Array.isArray(input.nodes)) {
    return input.nodes;
  }

  return [];
}

export default function FeaturedProductsSection({ products }) {
  const list = normalizeProducts(products);

  if (!list.length) {
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
    <section>
      <div className='grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {list.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
