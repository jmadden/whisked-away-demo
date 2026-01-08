// src/components/shop/ProductGrid.js
import ProductCard from '@/components/shop/ProductCard';

export default function ProductGrid({ products = [] }) {
  if (!products.length) {
    return (
      <div className='card p-8 text-center'>
        <div className='text-sm font-medium text-gray-900'>
          No products found
        </div>
        <p className='muted mt-2'>
          Try a different search or clear your filters.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {products.map(product => (
        <ProductCard key={product.id || product.handle} product={product} />
      ))}
    </div>
  );
}
