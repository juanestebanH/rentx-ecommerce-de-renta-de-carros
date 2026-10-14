import { Skeleton } from '@/shared/components/ui/skeleton';

export function PageLoader() {
  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <Skeleton className="size-10 rounded-full" />
    </div>
  );
}