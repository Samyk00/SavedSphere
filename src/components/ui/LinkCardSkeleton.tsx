import { Skeleton } from '@/components/ui/Skeleton';

export default function LinkCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-depth-1 border border-gray-200 overflow-hidden">
      {/* Thumbnail skeleton */}
      <div className="w-full h-32 bg-gray-100">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="p-2 space-y-2">
        {/* Title skeleton */}
        <Skeleton className="h-4 w-3/4" />

        {/* Description and tag row skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-8 rounded-full" />
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      </div>
    </div>
  );
}