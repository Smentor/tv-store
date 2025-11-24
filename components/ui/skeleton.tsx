import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
