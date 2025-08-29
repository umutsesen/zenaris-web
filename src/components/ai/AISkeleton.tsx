import { cn } from '../ui/utils';

export interface AISkeletonProps {
  variant?: 'row' | 'card';
  className?: string;
}

export function AISkeleton({ variant = 'row', className }: AISkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('rounded-2xl border bg-card p-4 animate-pulse', className)}>
        <div className="flex items-start gap-3">
          <div className="h-6 w-6 rounded-full bg-muted"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded-full w-16"></div>
              <div className="h-6 bg-muted rounded-full w-20"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-12"></div>
            <div className="h-6 bg-muted rounded w-16"></div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-8 bg-muted rounded w-20"></div>
          <div className="h-8 bg-muted rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 animate-pulse', className)}>
      <div className="h-4 w-4 rounded-full bg-muted"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-2/3"></div>
        <div className="h-3 bg-muted rounded w-1/3"></div>
      </div>
      <div className="h-6 bg-muted rounded-full w-16"></div>
    </div>
  );
}