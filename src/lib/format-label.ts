/**
 * Fills ICU-style placeholders ("Bild {current} von {total}") in message strings. Client
 * components receive templates instead of functions because functions cannot cross the
 * server/client boundary as props.
 */
export function formatLabel(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}
