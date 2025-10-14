import { Skeleton } from '@/components/ui/Skeleton';

export default function LinkListSkeleton() {
  return (
    <div className="bg-white rounded-lg p-3 shadow-depth-1 border border-gray-200">
      <div className="flex items-center gap-3">
        {/* Compact Thumbnail skeleton */}
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />

        {/* Compact Content skeleton */}
        <div className="flex-1 space-y-1">
          {/* Title skeleton */}
          <Skeleton className="h-4 w-3/4" />

          {/* Description and metadata skeleton */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-1/2" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-8 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        {/* Compact Actions skeleton */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Skeleton className="h-7 w-12 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </div>
    </div>
  );
}