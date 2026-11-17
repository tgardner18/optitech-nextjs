import type { ReactNode } from 'react'

/**
 * A small read-only code view with editor-style syntax colouring and line numbers, for the Topic Hub query inspector.
 * It colours one line at a time: `#` comments, `GET /path` requests, `key:   value` settings, and GraphQL / JSON tokens.
 * Colours live in topic-browser.css ([data-tok]); nothing here executes or injects HTML.
 */
type Tok = 'str' | 'var' | 'num' | 'kw' | 'type' | 'prop' | 'field' | 'punct' | 'comment' | 'verb' | 'path'

const TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|(\$\w+)|(-?\b\d+(?:\.\d+)?\b)|(\b(?:query|mutation|fragment|on|true|false|null)\b)|(\b[A-Z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*\b)|([A-Za-z_]\w*)(\s*:)?|([{}()[\]!:,.|=])/g

function span(kind: Tok, text: string, key: number): ReactNode {
  return <span key={key} data-tok={kind}>{text}</span>
}

function code(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0
    if (i > last) out.push(line.slice(last, i))
    if (m[1] !== undefined) {
      // a string followed by a colon is a JSON key
      out.push(span(m[2] ? 'prop' : 'str', m[1], k++))
      if (m[2]) out.push(span('punct', m[2], k++))
    } else if (m[3]) out.push(span('var', m[3], k++))
    else if (m[4]) out.push(span('num', m[4], k++))
    else if (m[5]) out.push(span('kw', m[5], k++))
    else if (m[6]) out.push(span('type', m[6], k++))
    else if (m[7]) {
      out.push(span(m[8] ? 'prop' : 'field', m[7], k++))
      if (m[8]) out.push(span('punct', m[8], k++))
    } else if (m[9]) out.push(span('punct', m[9], k++))
    last = i + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

function render(line: string): ReactNode {
  if (!line.trim()) return '​'
  if (line.trimStart().startsWith('#')) return span('comment', line, 0)
  const req = /^(GET|POST|PUT|DELETE)(\s+)(\S.*)$/.exec(line)
  if (req) return [span('verb', req[1], 0), req[2], span('path', req[3], 1)]
  // "setting:   value" lines in the inspector
  const kv = /^([A-Za-z][A-Za-z ]*?):(\s{2,})(.*)$/.exec(line)
  if (kv) return [span('prop', kv[1], 0), span('punct', ':', 1), kv[2], span('str', kv[3], 2)]
  return code(line)
}

export default function CodeView({ lines, label }: { lines: string[]; label: string }) {
  return (
    <pre data-part="insp-code" data-code="" aria-label={label} tabIndex={0}>
      {lines.map((l, i) => (
        <span key={i} data-line="">{render(l)}</span>
      ))}
    </pre>
  )
}
