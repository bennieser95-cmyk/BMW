import { cn } from '@/lib/cn'

export interface SpecRow {
  label: string
  /** Pre-formatted value including unit, e.g. "250 kW" or "18,2 kWh/100 km". */
  value: string
}

export interface SpecGroup {
  id: string
  title: string
  rows: SpecRow[]
}

export interface SpecTableProps {
  groups: SpecGroup[]
  /** Visible table caption, e.g. "Technische Daten". */
  caption: string
  className?: string
}

/**
 * Technical data as a real table: one tbody per group with a row header spanning both
 * columns, so screen readers announce group and label for every value.
 */
export function SpecTable({ groups, caption, className }: SpecTableProps) {
  return (
    <table className={cn('w-full border-collapse text-start text-base', className)}>
      <caption className="pb-4 text-start text-2xl font-medium">{caption}</caption>
      {groups.map((group) => (
        <tbody key={group.id}>
          <tr>
            <th
              id={`spec-${group.id}`}
              scope="colgroup"
              colSpan={2}
              className="border-border-strong text-text-muted border-b pt-8 pb-2 text-start text-sm font-medium tracking-wide uppercase"
            >
              {group.title}
            </th>
          </tr>
          {group.rows.map((row) => (
            <tr key={row.label} className="border-border border-b">
              <th scope="row" className="text-text-muted py-3 pe-4 text-start font-normal">
                {row.label}
              </th>
              <td className="text-text py-3 text-end font-medium tabular-nums">{row.value}</td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  )
}
