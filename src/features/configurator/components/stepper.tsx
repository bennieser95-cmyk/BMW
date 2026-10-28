'use client'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/cn'
import { formatLabel } from '@/lib/format-label'

export interface StepperStep {
  id: string
  label: string
  /** Completed steps stay reachable even when they lie after the current step. */
  complete?: boolean
}

export interface ConfiguratorStepperProps {
  steps: StepperStep[]
  /** Zero-based index of the active step. */
  currentStep: number
  /** Without it the stepper is read-only progress information. */
  onStepSelect?: (index: number) => void
  labels: {
    nav: string
    /** Template with {current} and {total}, e.g. "Schritt {current} von {total}". */
    stepOf: string
    completed: string
  }
  className?: string
}

/** Configurator progress (6 steps, BAV-UX-007 5.4). Current step is marked with aria-current. */
export function ConfiguratorStepper({
  steps,
  currentStep,
  onStepSelect,
  labels,
  className,
}: ConfiguratorStepperProps) {
  return (
    <nav aria-label={labels.nav} className={cn('w-full', className)}>
      <p className="sr-only" aria-live="polite">
        {formatLabel(labels.stepOf, { current: currentStep + 1, total: steps.length })}
      </p>
      <ol className="flex gap-1 overflow-x-auto">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep
          const isReachable = onStepSelect !== undefined && (index <= currentStep || step.complete === true)
          const content = (
            <>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-pill border text-xs tabular-nums',
                  isCurrent && 'border-text bg-text text-bg',
                  !isCurrent && step.complete && 'border-success text-success',
                  !isCurrent && !step.complete && 'border-border-strong text-text-muted',
                )}
              >
                {step.complete && !isCurrent ? <Icon name="check" size="sm" /> : index + 1}
              </span>
              <span className={cn('whitespace-nowrap', isCurrent ? 'font-medium text-text' : 'text-text-muted')}>
                {step.label}
              </span>
              {step.complete ? <span className="sr-only">({labels.completed})</span> : null}
            </>
          )

          return (
            <li
              key={step.id}
              className={cn('flex-1 border-b-2', isCurrent ? 'border-text' : 'border-border')}
            >
              {isReachable ? (
                <button
                  type="button"
                  aria-current={isCurrent ? 'step' : undefined}
                  onClick={() => onStepSelect(index)}
                  className="flex min-h-touch w-full items-center gap-2 px-2 text-sm hover:bg-surface"
                >
                  {content}
                </button>
              ) : (
                <span
                  aria-current={isCurrent ? 'step' : undefined}
                  className="flex min-h-touch items-center gap-2 px-2 text-sm"
                >
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
