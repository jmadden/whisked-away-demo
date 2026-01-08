// components/navbar.jsx (Server Component)
import Link from 'next/link';
import { Suspense } from 'react';
import { CartQty } from '@/components/CartQty';

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className='rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-amber-50 hover:text-gray-900'
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  return (
    <header className='sticky top-0 z-40 border-b border-amber-100 bg-white/80 backdrop-blur'>
      <nav className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8'>
        {/* Left: Brand + Nav */}
        <div className='flex items-center gap-6'>
          <Link href='/' className='group flex items-center gap-3'>
            {/* Simple whisk-ish mark */}
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm transition group-hover:bg-amber-200'>
              <svg
                className='h-6 w-6'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
              >
                <path
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 2c-2 3-2 7 0 10s2 7 0 10M8 4c-1.5 2.5-1.5 5.5 0 8s1.5 5.5 0 8M16 4c1.5 2.5 1.5 5.5 0 8s-1.5 5.5 0 8'
                />
              </svg>
            </div>

            <div className='leading-tight'>
              <div className='text-lg font-extrabold tracking-tight text-gray-900'>
                Whisked Away
              </div>
              <div className='hidden text-xs font-medium text-gray-500 sm:block'>
                Tools, ingredients, and recipes
              </div>
            </div>
          </Link>

          <div className='hidden items-center gap-1 md:flex'>
            <NavLink href='/'>Home</NavLink>
            <NavLink href='/products'>Products</NavLink>
            {/* <NavLink href='/recipes'>Recipes</NavLink> */}
          </div>
        </div>

        {/* Right: Cart */}
        <div className='flex items-center gap-2'>
          <Link
            href='/cart'
            className='group relative inline-flex items-center justify-center rounded-2xl border border-amber-100 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-amber-50 hover:shadow-md active:bg-amber-100'
            aria-label='Cart'
          >
            <svg
              className='h-5 w-5 text-gray-700 transition group-hover:text-gray-900'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 6h15l-1.5 9h-12z'
              />
              <path
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 6l-2-3H2'
              />
              <path
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z'
              />
            </svg>

            <span className='ml-2 hidden sm:inline'>Cart</span>

            {/* Qty badge */}
            <span className='ml-2 inline-flex min-w-[2.1rem] items-center justify-center rounded-full bg-amber-600 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm [&,span]:text-white'>
              <Suspense fallback={<span>0</span>}>
                <CartQty />
              </Suspense>
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className='mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8 md:hidden'>
        <div className='flex gap-2'>
          <NavLink href='/'>Home</NavLink>
          <NavLink href='/products'>Products</NavLink>
          {/* <NavLink href='/recipes'>Recipes</NavLink> */}
        </div>
      </div>
    </header>
  );
}
