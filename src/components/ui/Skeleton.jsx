import { cn } from '../../lib/cn';
import { Card } from './Card';

export const Skeleton = ({ className }) => <div className={cn('animate-pulse rounded-lg bg-sunken', className)} />;

export function SkeletonRows({ rows = 5 }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <Card>
      <SkeletonRows rows={rows} />
    </Card>
  );
}

export function FormSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Card className="space-y-5 p-5 sm:p-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </Card>
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}
