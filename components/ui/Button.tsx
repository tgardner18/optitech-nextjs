"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Style option types ───────────────────────────────────────────────────────

export type ButtonVariant = "brand" | "accent" | "ghost" | "signal" | "hover-fill" | "glass";
export type ButtonSize    = "sm" | "md" | "lg";

// ─── CVA configs ─────────────────────────────────────────────────────────────

const rootCva = cva(
  [
    "group relative inline-flex items-center justify-center",
    "select-none cursor-pointer",
    "text-label font-semibold tracking-label uppercase",
    "transition-[background-color,box-shadow,transform] duration-150 ease-quick",
    "focus-visible:outline-2 focus-visible:outline-offset-[3px]",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "aria-disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        brand: [
          "bg-brand text-fg-on-brand",
          "hover:bg-brand-hover hover:-translate-y-0.5",
          "hover:shadow-hover-lift",
          "active:translate-y-0 active:shadow-none",
          "focus-visible:outline-brand",
        ],
        accent: [
          "bg-accent text-fg-on-accent",
          "hover:bg-accent-hover hover:-translate-y-0.5",
          "hover:shadow-hover-lift",
          "active:translate-y-0 active:shadow-none",
          "focus-visible:outline-accent",
        ],
        ghost: [
          // Colors via CSS custom properties so data-surface="light" on any
          // parent flips transparent buttons to legible dark text automatically.
          "bg-transparent border",
          "[color:var(--ot-btn-ghost-fg)] [border-color:var(--ot-btn-ghost-border)]",
          "hover:[border-color:var(--ot-btn-ghost-border-hover)] hover:[background-color:var(--ot-btn-ghost-bg-hover)]",
          "focus-visible:outline-[var(--ot-btn-ghost-fg)]",
        ],
        signal: [
          // Kinetic fill sweep handled by .btn-signal in globals.css
          "btn-signal bg-surface border border-brand",
          "focus-visible:outline-brand",
        ],
        "hover-fill": [
          // Glow border; ::before fill fade handled by .btn-hover-fill in globals.css
          "btn-hover-fill bg-transparent border border-brand",
          "focus-visible:outline-brand",
        ],
        glass: [
          // Frosted glass — backdrop handled by .btn-glass in globals.css
          "btn-glass border",
          "focus-visible:outline-fg",
        ],
      },
      size: {
        sm: "px-7 py-3",
        md: "px-12 py-4",
        lg: "px-16 py-5",
      },
    },
    defaultVariants: { variant: "brand", size: "md" },
  }
);

// Inner span — always z-10 so it sits above the ::before sweep fill
const innerCva = cva("relative z-10 inline-flex items-center", {
  variants: {
    size: {
      sm: "gap-1.5",
      md: "gap-2",
      lg: "gap-2.5",
    },
  },
  defaultVariants: { size: "md" },
});

// Icon wrapper — constrains the icon to a consistent optical size.
// [&>svg]:w-full forces Lucide (and other inline SVG) icons to fill the container.
const iconCva = cva("flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full", {
  variants: {
    size: {
      sm: "w-4 h-4",
      md: "w-[18px] h-[18px]",
      lg: "w-5 h-5",
    },
  },
  defaultVariants: { size: "md" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonProps = {
  variant?:     ButtonVariant;
  size?:        ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  disabled?:    boolean;
  children:     ReactNode;
  className?:   string;
  /** Internal Next.js route or external URL. Renders as <Link> or <a>. */
  href?:        string;
  /** Only applies when href is omitted (button semantics). */
  type?:        "button" | "submit" | "reset";
  onClick?:     React.MouseEventHandler;
  "aria-label"?: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Button({
  variant      = "brand",
  size         = "md",
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  className,
  href,
  type         = "button",
  onClick,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const isSignal    = variant === "signal";
  const isHoverFill = variant === "hover-fill";
  const classes     = cn(rootCva({ variant, size }), className);

  // Text color logic: signal and hover-fill both start as brand and transition to
  // fg-on-brand once the fill arrives (synced to the respective animation delay).
  const needsTextTransition = isSignal || isHoverFill;

  const content = (
    <span
      className={cn(
        innerCva({ size }),
        needsTextTransition && [
          "text-brand",
          "group-hover:text-fg-on-brand",
          "group-focus-visible:text-fg-on-brand",
          "motion-safe:transition-colors motion-safe:duration-150 motion-safe:delay-75 motion-safe:ease-quick",
        ],
        variant === "glass" && [
          // Responds to --ot-btn-clear-fg: white on dark surfaces, dark on light.
          "text-(--ot-btn-clear-fg)",
        ]
      )}
    >
      {leadingIcon && (
        <span aria-hidden="true" className={iconCva({ size })}>
          {leadingIcon}
        </span>
      )}
      {children}
      {trailingIcon && (
        <span aria-hidden="true" className={iconCva({ size })}>
          {trailingIcon}
        </span>
      )}
    </span>
  );

  if (href !== undefined) {
    const isExternal = /^https?:\/\//.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          aria-label={ariaLabel}
          aria-disabled={disabled || undefined}
          onClick={onClick}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
