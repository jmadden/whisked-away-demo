// components/navbar.jsx (Server Component)
import { Suspense } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { CartQty } from '@/components/CartQty';

export function Navbar() {
  return (
    <nav className='w-full py-5 flex items-center justify-between'>
      <div className='flex items-center gap-8'>
        <Link href='/'>
          <h1 className='text-3xl font-bold'>Whisked Away</h1>
        </Link>

        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: 'ghost' })} href='/'>
            Home
          </Link>
          <Link
            className={buttonVariants({ variant: 'ghost' })}
            href='/products'
          >
            Products
          </Link>
          <Link
            className={buttonVariants({ variant: 'ghost' })}
            href='/recipes'
          >
            Recipes
          </Link>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <div className='hidden md:block mr-2' />

        <Link href='/cart' className='text-gray-700 hover:text-gray-900'>
          Cart{' '}
          <Suspense fallback={<span className='text-gray-500'>(0)</span>}>
            <CartQty />
          </Suspense>
        </Link>
      </div>
    </nav>
  );
}
