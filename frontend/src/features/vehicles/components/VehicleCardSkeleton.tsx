import { Skeleton } from '@/shared/components/ui/skeleton';
import { Card } from '@/shared/components/ui/card';

export function VehicleCardSkeleton() {
  return (
    <Card className="h-full gap-0 overflow-hidden p-0">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="mt-3 flex gap-3">
          <Skeleton className="h-3.5 w-1/5" />
          <Skeleton className="h-3.5 w-1/5" />
          <Skeleton className="h-3.5 w-1/5" />
        </div>
        <Skeleton className="mt-auto h-6 w-1/3" />
        <Skeleton className="mt-4 h-9 w-full" />
      </div>
    </Card>
  );
}