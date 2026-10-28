#!/usr/bin/env node
// Verifies WCAG 2.2 contrast ratios of the colour tokens in src/styles/tokens.css for light and
// dark mode and prints a Markdown table. Exits with code 1 if any required pair fails.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const tokensPath = fileURLToPath(new URL('../../src/styles/tokens.css', import.meta.url))
const css = readFileSync(tokensPath, 'utf8')

function readBlock(startMarker) {
  const start = css.indexOf(startMarker)
  if (start === -1) throw new Error(`Block not found: ${startMarker}`)
  const end = css.indexOf('}', css.indexOf('{', start))
  return css.slice(start, end)
}

function parseColours(block) {
  const colours = {}
  for (const match of block.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)) {
    colours[match[1]] = match[2]
  }
  return colours
}

const light = parseColours(readBlock('@theme static'))
const dark = { ...light, ...parseColours(readBlock(":root[data-theme='dark']")) }

function toLinear(channel) {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function getLuminance(hex) {
  const [r, g, b] = [1, 3, 5].map((index) =>
    toLinear(Number.parseInt(hex.slice(index, index + 2), 16)),
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function calculateContrast(foreground, background) {
  const [high, low] = [getLuminance(foreground), getLuminance(background)].sort((a, b) => b - a)
  return (high + 0.05) / (low + 0.05)
}

// [foreground, background, minimum ratio, usage]
const PAIRS = [
  ['text', 'bg', 4.5, 'Fließtext'],
  ['text', 'surface', 4.5, 'Fließtext auf Karten'],
  ['text-muted', 'bg', 4.5, 'Sekundärtext'],
  ['text-muted', 'surface', 4.5, 'Sekundärtext auf Karten'],
  ['brand-primary', 'bg', 4.5, 'Links, Ghost-Buttons'],
  ['brand-primary', 'surface', 4.5, 'Links auf Karten'],
  ['on-brand', 'brand-primary', 4.5, 'Label Primary-Button'],
  ['on-brand', 'brand-primary-hover', 4.5, 'Label Primary-Button (Hover)'],
  ['brand-accent', 'bg', 4.5, 'Akzenttext (nur auf bg)'],
  ['success', 'bg', 4.5, 'Statustext'],
  ['success', 'surface', 4.5, 'Statustext auf Karten'],
  ['warning', 'bg', 4.5, 'Statustext'],
  ['warning', 'surface', 4.5, 'Statustext auf Karten'],
  ['danger', 'bg', 4.5, 'Fehlertext'],
  ['danger', 'surface', 4.5, 'Fehlertext auf Karten'],
  ['focus', 'bg', 3, 'Fokusring (Nicht-Text)'],
  ['focus', 'surface', 3, 'Fokusring auf Karten (Nicht-Text)'],
  ['border-strong', 'bg', 3, 'Kontur Formularfeld (Nicht-Text)'],
  ['border-strong', 'surface', 3, 'Kontur Formularfeld auf Karten (Nicht-Text)'],
]

// Worst case for text on media: the 50 % scrim stop composited over a pure white photo.
function getScrimOverWhite() {
  const stop = css.match(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\) 50%/)
  if (!stop) throw new Error('Scrim stop at 50% not found in --gradient-scrim')
  const [red, green, blue, alpha] = stop.slice(1).map(Number)
  const blend = (channel) => Math.round(channel * alpha + 255 * (1 - alpha))
  return `#${[red, green, blue].map((channel) => blend(channel).toString(16).padStart(2, '0')).join('')}`
}
light['scrim-over-white'] = getScrimOverWhite()
dark['scrim-over-white'] = light['scrim-over-white']
PAIRS.push(['on-media', 'scrim-over-white', 4.5, 'Text auf Hero-Scrim über weißem Foto (Worst Case)'])

let hasFailure = false
const rows = [
  '| Vordergrund | Hintergrund | Verwendung | Min. | Hell | Dunkel | Ergebnis |',
  '|---|---|---|---|---|---|---|',
]

for (const [foreground, background, minimum, usage] of PAIRS) {
  const lightRatio = calculateContrast(light[foreground], light[background])
  const darkRatio = calculateContrast(dark[foreground], dark[background])
  const passes = lightRatio >= minimum && darkRatio >= minimum
  hasFailure ||= !passes
  rows.push(
    `| \`--color-${foreground}\` | \`--color-${background}\` | ${usage} | ${minimum}:1 | ${lightRatio.toFixed(2)}:1 | ${darkRatio.toFixed(2)}:1 | ${passes ? 'bestanden' : 'NICHT bestanden'} |`,
  )
}

// stdout instead of console.log: the table is the script's output and can be piped into docs.
process.stdout.write(`${rows.join('\n')}\n`)
if (hasFailure) {
  process.stderr.write('\nAt least one token pair is below the required contrast ratio.\n')
  process.exit(1)
}
