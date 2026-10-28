/**
 * Serialises structured data for a <script type="application/ld+json"> tag. Escaping "<"
 * prevents a value like "</script>" from breaking out of the script element (XSS).
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
