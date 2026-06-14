#!/usr/bin/env node
/**
 * check-color-literals.mjs — token-derived color guard for block components.
 *
 * The whole site recalibrates from the ~11 semantic color tokens when
 * ThemeManager overrides them. Any RAW color literal in a block component is a
 * latent rebrand bug: it will NOT follow the theme. The only sanctioned way to
 * write a concrete color in block code is CSS relative color syntax that reads
 * from a token, e.g. `oklch(from var(--ot-brand) l c h / 0.3)`.
 *
 * This script scans components/blocks/**\/*.{ts,tsx} and fails (exit 1) on any
 *   oklch( | hsl( | rgb( | rgba( | #hex
 * whose first argument is NOT `from var(` — i.e. a raw literal.
 *
 * Escape hatch: append `/* token-exempt: <reason> *\/` on the SAME line for
 * unavoidable cases (e.g. fixed data-viz palettes consumed by a charting
 * library as SVG attributes, where var() does not resolve).
 *
 * Scope: components/blocks only for now. globals.css is a separate, larger audit.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SCAN_DIR = join(ROOT, 'components', 'blocks')

// Color-function literals: capture what immediately follows the opening paren.
// A literal is OK only when that first token is `from var(` (relative color
// syntax reading from a token).
const FN_RE = /\b(oklch|oklab|lch|lab|hsl|hsla|hwb|rgb|rgba|color)\s*\(\s*([^)]*)/gi
// Hex color literals: #rgb, #rgba, #rrggbb, #rrggbbaa (word-bounded).
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g
const EXEMPT_RE = /token-exempt:/

/** Recursively collect .ts/.tsx files under dir. */
function collect(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...collect(full))
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full)
  }
  return out
}

const violations = []

for (const file of collect(SCAN_DIR)) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (EXEMPT_RE.test(line)) return // same-line escape hatch

    // Color functions — first arg must start with `from var(`
    FN_RE.lastIndex = 0
    let m
    while ((m = FN_RE.exec(line)) !== null) {
      const firstArg = m[2].trimStart()
      // Accept both the CSS form `from var(` and the Tailwind arbitrary-value
      // form `from_var(` (underscores compile to spaces in class names).
      if (!/^from[\s_]+var\(/.test(firstArg)) {
        violations.push({ file, line: i + 1, snippet: `${m[1]}(${m[2].trim()}…` })
      }
    }

    // Hex literals — never token-derived
    HEX_RE.lastIndex = 0
    let h
    while ((h = HEX_RE.exec(line)) !== null) {
      violations.push({ file, line: i + 1, snippet: h[0] })
    }
  })
}

if (violations.length > 0) {
  console.error(`\n✖ ${violations.length} raw color literal(s) found in components/blocks.`)
  console.error('  Use oklch(from var(--ot-*) l c h / α) relative color syntax, or add')
  console.error('  an inline /* token-exempt: <reason> */ comment for unavoidable cases.\n')
  for (const v of violations) {
    console.error(`  ${relative(ROOT, v.file)}:${v.line}  ${v.snippet}`)
  }
  console.error('')
  process.exit(1)
}

console.log('✓ No raw color literals in components/blocks — all colors are token-derived.')
