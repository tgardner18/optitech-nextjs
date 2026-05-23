/**
 * Shared Tailwind class string for all text-type form inputs
 * (input[text], input[number], input[url], textarea, select).
 *
 * Design: subtle filled container with a thin all-around border.
 * On focus: brand-coloured border + brightened fill + soft brand glow
 * (glow applied via the .ot-field CSS class in globals.css).
 */
export const inputBase = [
  // Layout
  'w-full ot-field',
  // Shape — filled body so the field is distinct from the dark canvas behind it
  'bg-fg/[0.05] border border-fg/[0.08] rounded-input',
  // Padding — full border means we need horizontal padding now
  'px-md py-3',
  // Typography
  'text-body text-fg',
  // Placeholder — neutral opacity from fg (avoids the teal fg-muted tint)
  'placeholder:text-fg/25',
  // Focus — brand border + brighter fill; glow is in globals.css .ot-field
  'focus:outline-none',
  'focus-visible:border-brand focus-visible:bg-fg/[0.08]',
  // Transitions
  'transition-[border-color,background-color,box-shadow] duration-150 ease-quick',
  // State
  'disabled:opacity-40',
].join(' ')
