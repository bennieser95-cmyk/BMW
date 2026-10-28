export interface SkipLinkProps {
  label: string
  /** Id of the main landmark, without "#". */
  targetId?: string
}

/** First focusable element on every page; visible only on keyboard focus (WCAG 2.4.1). */
export function SkipLink({ label, targetId = 'main-content' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="focus:bg-bg focus:text-text focus:shadow-3 sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-(--z-toast) focus:rounded-sm focus:px-4 focus:py-3"
    >
      {label}
    </a>
  )
}
