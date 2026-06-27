// The free-text locationLabel rendered as an accent badge. Sharp corners,
// uppercase label type, accent ground with fg-on-accent text — the system's
// signal-color treatment. Two tones: 'accent' (default, on photo/plate) and
// 'soft' (a low-alpha accent tint for use on the page ground beside dark text).

type Props = {
  label: string
  tone?: 'accent' | 'soft'
  className?: string
}

export default function LocationLabelBadge({ label, tone = 'accent', className = '' }: Props) {
  const base =
    'inline-flex items-center whitespace-nowrap px-2 py-0.5 text-[0.625rem] font-bold uppercase leading-none tracking-[0.08em]'

  if (tone === 'soft') {
    return (
      <span
        className={`${base} ${className}`}
        style={{
          background: 'oklch(from var(--ot-accent) l c h / 0.14)',
          color:      'var(--ot-accent)',
          border:     '1px solid oklch(from var(--ot-accent) l c h / 0.22)',
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className={`${base} ${className}`}
      style={{ background: 'var(--ot-accent)', color: 'var(--ot-fg-on-accent)' }}
    >
      {label}
    </span>
  )
}
