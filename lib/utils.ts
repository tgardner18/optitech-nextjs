import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Extended tailwind-merge that knows about this project's custom @theme utilities.
 *
 * Problem: tailwind-merge groups ALL unknown `text-*` classes together and
 * removes any that appear before the last one — stripping color utilities like
 * `text-fg-on-brand` when combined with font-size utilities like `text-display`.
 *
 * Fix: register two custom class groups.
 *
 * 'ot-text-size'  — our custom scale utilities (text-display, text-headline, …)
 *   Using a custom group name (not the built-in 'font-size') avoids inheriting
 *   tailwind-merge's built-in font-size ↔ line-height conflict rule, which would
 *   otherwise strip 'leading-none' when 'text-display' appears on the same element.
 *
 * 'text-color'    — appends our semantic color utilities to Tailwind's existing
 *   text-color group so they conflict with each other (correct) but NOT with size
 *   or line-height utilities (also correct).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "ot-text-size": [
        "text-display",
        "text-headline",
        "text-title",
        "text-body",
        "text-label",
      ],
      "text-color": [
        "text-brand",
        "text-brand-hover",
        "text-accent",
        "text-accent-hover",
        "text-canvas",
        "text-surface",
        "text-fg",
        "text-fg-muted",
        "text-fg-on-brand",
        "text-fg-on-accent",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
