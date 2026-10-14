import { Skeleton } from '@/shared/components/ui/skeleton';

export function RentalCardSkeleton() {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border bg-card shadow-sm sm:flex-row">
      <Skeleton className="aspect-video w-full rounded-none sm:w-48" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}