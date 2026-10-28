import { cn } from '@/lib/cn'

export interface LogoProps {
  /** Accessible name, e.g. "Bavaria Motors – Startseite". */
  label: string
  /** "full" shows emblem + wordmark, "emblem" only the monogram (tight spaces, favicons). */
  variant?: 'full' | 'emblem'
  className?: string
}

/*
 * Original logo for the fictional brand "Bavaria Motors": an angular "B" monogram inside a
 * chamfered square. Deliberately geometric and unlike any real automotive roundel.
 * Uses currentColor so it adapts to light/dark and to transparent headers over media.
 */
export function Logo({ label, variant = 'full', className }: LogoProps) {
  const isFull = variant === 'full'

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={isFull ? '0 0 220 40' : '0 0 40 40'}
      className={cn('h-8 w-auto fill-current', className)}
      focusable="false"
    >
      <path d="M8 2h24l6 6v24l-6 6H8l-6-6V8z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M13 10h10.5a5 5 0 0 1 3.4 8.7A5.5 5.5 0 0 1 24 30H13zm4.5 3.8v4.4h5.4a2.2 2.2 0 0 0 0-4.4zm0 7.8v4.6h6a2.3 2.3 0 0 0 0-4.6z" />
      {isFull ? (
        <g>
          <text
            x="50"
            y="19"
            fontFamily="var(--font-sans), system-ui, sans-serif"
            fontSize="15"
            fontWeight="600"
            letterSpacing="3.5"
          >
            BAVARIA
          </text>
          <text
            x="50"
            y="34"
            fontFamily="var(--font-sans), system-ui, sans-serif"
            fontSize="9"
            fontWeight="400"
            letterSpacing="5.2"
          >
            MOTORS
          </text>
        </g>
      ) : null}
    </svg>
  )
}
