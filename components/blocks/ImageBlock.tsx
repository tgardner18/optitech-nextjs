"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Maximize2, X } from "lucide-react";

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

export type ImageStyleOptions = {
  /** Lock to a specific aspect ratio — no value renders at the natural image proportion */
  ratio?: "16:9" | "4:3" | "3:2" | "1:1";
  /** Cap the rendered height so tall images don't dominate narrow columns */
  maxHeight?: "none" | "xs" | "sm" | "md" | "lg";
  /** Teal brand wash via mix-blend-mode: multiply — works best on light-toned imagery */
  overlay?: boolean;
  /**
   * Frame treatment:
   * "offset" — bold editorial: teal backing block visible as a 12px strip on the
   *            right/bottom edges, like a designer's mounting board.
   * "glow"   — atmospheric: inset teal edge glow + outer ambient bloom, as if the
   *            image is backlit from within.
   */
  frame?: "offset" | "glow";
  /** Scroll-triggered wipe reveal: teal bar sweeps right, image follows on its heels */
  animate?: boolean;
  /** "inset" floats the caption over the image bottom-left; "below" places it beneath */
  captionPosition?: "inset" | "below";
  /**
   * Dual-source colored bloom shadow: teal anchor radiates from the bottom-left,
   * signal green from the bottom-right. Bleeds past the image edge so the image
   * appears to float above a chromatic halo. Isolation keeps it inside the figure.
   */
  shadow?: boolean;
  /**
   * Click-to-expand lightbox: shows the image full-screen with backdrop blur.
   * Ideal for architecture diagrams, detailed screenshots, or any image where
   * the small rendition is hard to read.
   */
  lightbox?: boolean;
};

export type ImageBlockProps = {
  src: string;
  alt: string;
  caption?: string;
  styleOptions?: ImageStyleOptions;
  previewAttrs?: Record<string, Record<string, string | undefined>>;
};

// ─── Aspect ratio map ─────────────────────────────────────────────────────────

const RATIO_CLASS: Record<NonNullable<ImageStyleOptions["ratio"]>, string> = {
  "16:9": "aspect-video",
  "4:3":  "aspect-4/3",
  "3:2":  "aspect-3/2",
  "1:1":  "aspect-square",
};

const MAX_H_CLASS: Record<NonNullable<ImageStyleOptions["maxHeight"]>, string> = {
  none: "",
  xs:   "max-h-[200px]",
  sm:   "max-h-[320px]",
  md:   "max-h-[480px]",
  lg:   "max-h-[640px]",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ImageBlock({
  src,
  alt,
  caption,
  styleOptions = {},
  previewAttrs,
}: ImageBlockProps) {
  const {
    ratio,
    maxHeight       = "none",
    overlay         = false,
    frame,
    animate         = false,
    captionPosition = "inset",
    shadow          = false,
    lightbox        = false,
  } = styleOptions;

  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!animate) return;

    const el = containerRef.current;
    if (!el) return;

    if (prefersReducedMotion) {
      const rafId = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(rafId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate, prefersReducedMotion]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const aspectClass = ratio ? RATIO_CLASS[ratio] : "aspect-video";
  const maxHClass   = MAX_H_CLASS[maxHeight];

  /* clip-path wipe: image reveals left-to-right as the right inset shrinks */
  const imageRevealStyle: React.CSSProperties = animate
    ? {
        clipPath: revealed ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
        transition: "clip-path 600ms cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: revealed ? "100ms" : "0ms",
      }
    : {};

  /* teal bar: starts full-cover, sweeps off to the right ahead of the image */
  const barStyle: React.CSSProperties = animate
    ? {
        transform: revealed ? "translateX(105%)" : "translateX(0%)",
        transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
      }
    : {};

  const hasInsetCaption = caption && captionPosition === "inset";
  const hasBelowCaption = caption && captionPosition === "below";

  /*
   * Shadow bloom: two radial gradients share the bottom of the figure —
   * teal (brand) pools bottom-left, signal green (accent) pools bottom-right.
   * Heavy blur (~52px) diffuses them into a chromatic halo.
   * isolation: isolate on the figure creates a contained stacking context so
   * z-index: -1 here paints between the page canvas and the image, not behind
   * the entire page.
   */
  const shadowStyle: React.CSSProperties = {
    position: "absolute",
    left: "6%",
    right: "6%",
    top: "28%",
    bottom: "-28px",
    background:
      "radial-gradient(ellipse at 22% 100%, var(--ot-bloom-brand)  0%, transparent 58%), " +
      "radial-gradient(ellipse at 78% 100%, var(--ot-bloom-accent) 0%, transparent 58%)",
    filter: "blur(52px)",
    transform: "scaleX(0.86)",
    zIndex: -1,
  };

  /*
   * Glow frame: brand inset ring + outer border; accent adds a 1px chromatic halo
   * outside the brand border and a directional bloom rising from below.
   */
  const glowStyle: React.CSSProperties = frame === "glow"
    ? {
        boxShadow:
          "inset 0 0 0 2px var(--ot-bloom-brand-ring), " +
          "0 0 0 1px var(--ot-bloom-brand-border), " +
          "0 0 0 2px var(--ot-bloom-accent-border), " +
          "0 0 52px var(--ot-bloom-brand-faint), " +
          "0 20px 72px var(--ot-bloom-accent-faint)",
      }
    : {};

  // ── Core image markup (shared between normal and lightbox-trigger modes) ────

  const imageContainerEl = (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-ot-surface ${aspectClass}${maxHClass ? ` ${maxHClass}` : ""}${frame === "offset" ? " z-10" : ""}`}
      style={glowStyle}
      {...(previewAttrs?.image ?? {})}
    >
      {animate && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-brand z-20 pointer-events-none"
          style={barStyle}
        />
      )}
      <div className="absolute inset-0" style={imageRevealStyle}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 1200px, 100vw"
        />
        {overlay && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: "var(--ot-brand)", opacity: 0.4, mixBlendMode: "multiply" }}
          />
        )}
        {hasInsetCaption && (
          <figcaption className="absolute bottom-0 left-0 z-10 bg-canvas/90 px-sm py-xs max-w-[70%]">
            <p className="text-label text-fg-muted leading-snug" {...(previewAttrs?.caption ?? {})}>{caption}</p>
          </figcaption>
        )}
      </div>

      {/* Expand hint — visible on hover when lightbox is enabled */}
      {lightbox && (
        <div
          aria-hidden="true"
          className="absolute top-2 right-2 z-30 rounded-ot-control p-1.5 bg-canvas/75 backdrop-blur-sm text-fg opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:transition-opacity motion-safe:duration-150 pointer-events-none"
        >
          <Maximize2 className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  return (
    <>
      <figure className={`relative${shadow ? " isolate pb-7" : ""}`}>

        {shadow && <div aria-hidden="true" style={shadowStyle} />}

        <div className={frame === "offset" ? "relative pr-3 pb-3" : ""}>
          {frame === "offset" && (
            <div aria-hidden="true" className="absolute top-3 left-3 right-0 bottom-0 bg-brand rounded-ot-surface" />
          )}

          {lightbox ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={`View full size${alt ? `: ${alt}` : ''}`}
              className="block w-full text-left group cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {imageContainerEl}
            </button>
          ) : (
            imageContainerEl
          )}
        </div>

        {hasBelowCaption && (
          <figcaption className="mt-sm">
            <p className="text-label text-fg-muted" {...(previewAttrs?.caption ?? {})}>{caption}</p>
          </figcaption>
        )}
      </figure>

      {/* ── Lightbox overlay ────────────────────────────────────────────────── */}
      {/* Portaled to document.body: composition columns retain a transform after
          their stagger animation (animation-fill-mode: both holds translateY(0)),
          and any non-none transform makes that ancestor the containing block for
          position:fixed descendants — which would trap this overlay inside the
          column instead of covering the viewport. The portal escapes all
          transformed/filtered ancestors so `fixed` resolves against the viewport. */}
      {lightbox && lightboxOpen && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || 'Full size image'}
          className="fixed inset-0 z-[9999] bg-canvas/95 backdrop-blur-md"
          style={{ animation: 'fadeIn 0.15s cubic-bezier(0.16,1,0.3,1) both' }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Image fills the full viewport — click stops propagation so only backdrop click closes */}
          <div
            className="absolute inset-0 p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="100vw"
                quality={95}
                className="object-contain"
              />
            </div>
            {caption && (
              <p className="absolute bottom-6 left-0 right-0 text-center text-label text-fg-muted">{caption}</p>
            )}
          </div>

          {/* Close button — top-right of overlay */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close full size image"
            className="absolute top-4 right-4 z-10 p-2 bg-surface/80 hover:bg-surface text-fg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X className="w-5 h-5" />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
