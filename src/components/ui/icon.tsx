import { cva } from 'class-variance-authority'
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Download,
  ExternalLink,
  Info,
  MapPin,
  Menu,
  Minus,
  Moon,
  Pause,
  Phone,
  Play,
  Plus,
  Search,
  Sun,
  User,
  X,
  ZoomIn,
} from 'lucide-react'

import { cn } from '@/lib/cn'

import type { VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'

/*
 * A curated map instead of re-exporting all of lucide keeps the bundle small (tree shaking)
 * and the visual language consistent.
 */
const ICONS = {
  'alert-circle': AlertCircle,
  'arrow-right': ArrowRight,
  check: Check,
  'check-circle': CircleCheck,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  close: X,
  download: Download,
  'external-link': ExternalLink,
  info: Info,
  'map-pin': MapPin,
  menu: Menu,
  minus: Minus,
  moon: Moon,
  pause: Pause,
  phone: Phone,
  play: Play,
  plus: Plus,
  search: Search,
  sun: Sun,
  user: User,
  'zoom-in': ZoomIn,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

export const iconVariants = cva('inline-block shrink-0', {
  variants: {
    size: { sm: 'size-4', md: 'size-6', lg: 'size-8' },
  },
  defaultVariants: { size: 'md' },
})

export interface IconProps extends VariantProps<typeof iconVariants> {
  name: IconName
  /** Accessible name. Without it the icon is treated as decorative (aria-hidden). */
  label?: string
  className?: string
}

/** Wrapper around lucide-react with consistent sizing and a11y semantics. */
export function Icon({ name, label, size, className }: IconProps) {
  const Glyph = ICONS[name]
  const a11y = label
    ? ({ role: 'img', 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const)

  return (
    <Glyph
      className={cn(iconVariants({ size }), className)}
      strokeWidth={1.5}
      focusable="false"
      {...a11y}
    />
  )
}
