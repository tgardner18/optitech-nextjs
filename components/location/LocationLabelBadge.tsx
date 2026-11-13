// The free-text locationLabel as a chip. Styled by location-listing.css (data-part="chip"):
// 12px, a readable ink on a soft tint. `tone` is kept so existing callers compile; both tones look the same now.
type Props = { label: string; tone?: 'accent' | 'soft'; className?: string }

export default function LocationLabelBadge({ label, className }: Props) {
  return <span data-part="chip" className={className}>{label}</span>
}
