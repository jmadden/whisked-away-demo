// components/home/hero.js
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className='py-16'>
      <div className='rounded-2xl border border-black/10 bg-white p-10'>
        <h1 className='text-4xl font-bold tracking-tight text-black'>
          Whisked Away
        </h1>
        <p className='mt-3 max-w-2xl text-lg text-black/70'>
          Baking supplies, recipes, and the gear that makes your kitchen feel
          like a tiny science lab.
        </p>

        <div className='mt-6 flex gap-3'>
          <Link
            className={buttonVariants({ variant: 'default' })}
            href='/products'
          >
            Shop products
          </Link>
          <Link
            className={buttonVariants({ variant: 'outline' })}
            href='/recipes'
          >
            Browse recipes
          </Link>
        </div>
      </div>
    </section>
  );
}
