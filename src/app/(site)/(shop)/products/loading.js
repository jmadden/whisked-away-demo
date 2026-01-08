import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingProducts() {
  return (
    <main className='container-page'>
      <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
        <div>
          <Skeleton className='h-9 w-40' />
          <Skeleton className='mt-3 h-5 w-72' />
        </div>

        <div className='card flex flex-col gap-3 p-4 md:flex-row md:items-end'>
          <div className='min-w-[220px]'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='mt-2 h-10 w-full' />
          </div>
          <div className='min-w-[200px]'>
            <Skeleton className='h-4 w-12' />
            <Skeleton className='mt-2 h-10 w-full' />
          </div>
          <div className='min-w-[180px]'>
            <Skeleton className='h-4 w-10' />
            <Skeleton className='mt-2 h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-28 md:ml-2' />
          <Skeleton className='h-10 w-24' />
        </div>
      </div>

      <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'
          >
            <Skeleton className='aspect-[4/3] w-full' />
            <div className='p-4'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='mt-3 h-4 w-1/3' />
              <Skeleton className='mt-4 h-10 w-full' />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
