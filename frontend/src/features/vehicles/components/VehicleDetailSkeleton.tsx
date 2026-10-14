export function VehicleDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}