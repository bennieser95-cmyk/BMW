import { Skeleton } from '@/components/ui/skeleton'

/** Same footprint as VehicleCard so swapping skeleton → card causes no layout shift. */
export function VehicleCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md bg-surface">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    </div>
  )
}
