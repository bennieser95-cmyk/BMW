import { cn } from '@/lib/cn'

import type { ComponentPropsWithRef } from 'react'

export type SkeletonProps = ComponentPropsWithRef<'div'>

/**
 * Loading placeholder. BAV-UX-007 prefers skeletons over spinners because they preserve layout
 * (no CLS) and communicate the shape of the coming content.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-sm bg-border motion-safe:animate-pulse', className)}
      {...props}
    />
  )
}
