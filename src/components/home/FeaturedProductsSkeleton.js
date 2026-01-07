import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedProductsSkeleton() {
  return (
    <div>
      <div className='flex items-baseline justify-between border-b-2 border-black pb-2 mb-6'>
        <Skeleton className='h-7 w-56' />
        <Skeleton className='h-4 w-24' />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='rounded-xl border border-black/10 p-4'>
            <Skeleton className='h-40 w-full rounded-lg' />
            <Skeleton className='mt-3 h-4 w-3/4' />
            <Skeleton className='mt-2 h-4 w-1/2' />
          </div>
        ))}
      </div>
    </div>
  );
}
