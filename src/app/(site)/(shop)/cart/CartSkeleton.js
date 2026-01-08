import { Skeleton } from '@/components/ui/skeleton';

export default function CartSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
      <div className='lg:col-span-2'>
        <div className='card divide-y divide-gray-200'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='p-4 sm:p-6'>
              <div className='flex gap-4'>
                <Skeleton className='h-20 w-28 rounded-xl' />
                <div className='flex-1'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='w-2/3'>
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='mt-2 h-4 w-1/3' />
                    </div>
                    <Skeleton className='h-4 w-16' />
                  </div>

                  <div className='mt-4 flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='h-4 w-10' />
                      <Skeleton className='h-10 w-24' />
                      <Skeleton className='h-10 w-24' />
                    </div>
                    <Skeleton className='h-6 w-16' />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className='lg:col-span-1'>
        <div className='card p-6'>
          <Skeleton className='h-5 w-24' />
          <div className='mt-4 space-y-3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
          </div>
          <div className='mt-6 space-y-3'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
      </aside>
    </div>
  );
}
