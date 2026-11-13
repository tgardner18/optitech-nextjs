"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Maximize2, X } from "lucide-react";

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

export type ImageStyleOptions = {
  /** Lock to a specific aspect ratio — only used for standalone sections where height should be constrained */
  ratio?: "16:9" | "4:3" | "3:2" | "1:1";
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
  /** Scroll-triggered wipe reveal: teal bar sweeps right, image follows on its heels.
   *  Not exposed as a CMS setting on OT_ImageBlock — kept for callers (e.g. CampaignPage)
   *  that set styleOptions programmatically. */
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
  /** True when rendered on a brand-colored background — inverts frame/animate accents to fg-on-brand */
  invertedBg?: boolean;
  /**
   * Controls how the image fills its container. Defaults to "cover".
   * "cover"   — fills the box, cropping overflow. Best for photography.
   * "contain" — fits the whole image inside the box without cropping.
   *             Use for logos, icons, or diagrams where cropping would
   *             cut off content. Ignored when frame is "glow" (always cover),
   *             and when mediaSize is anything but "fill" (always contain).
   */
  objectFit?: "cover" | "contain";
  /**
   * Sizes the image to its own content instead of stretching to the column.
   * "fill"   — (Default) stretch to the column/aspect-ratio box — see fillHeight.
   * "small" / "medium" / "large" — render at a fixed, natural-proportioned
   *            box that never crops. For logos, seals, and icons where the
   *            image should sit compact above or beside text, not fill it.
   *            Overrides fillHeight, ratio, and objectFit while active.
   */
  mediaSize?: "fill" | "small" | "medium" | "large";
};

export type ImageBlockProps = {
  src: string;
  alt: string;
  caption?: string;
  styleOptions?: ImageStyleOptions;
  previewAttrs?: Record<string, Record<string, string | undefined>>;
  /** @deprecated No longer used. The image always keeps its aspect ratio (see media.css). */
  fillHeight?: boolean;
};

// ─── Media size map (compact, never-crop boxes for logos/icons) ──────────────

const MEDIA_SIZE_CLASS: Record<"small" | "medium" | "large", string> = {
  small:  "h-10 w-32",
  medium: "h-16 w-48",
  large:  "h-24 w-64",
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
    overlay         = false,
    frame,
    animate         = false,
    captionPosition = "inset",
    shadow          = false,
    lightbox        = false,
    invertedBg      = false,
    objectFit       = "cover",
    mediaSize       = "fill",
  } = styleOptions;

  const isCompact = mediaSize !== "fill";
  const effectiveObjectFit = isCompact ? "contain" : objectFit;

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

  /* Frame, shadow bloom, overlay tint and caption styling all live in media.css, keyed on the
   * figure's data attributes. Only the compact box keeps utility sizing (it never uses a ratio). */
  const boxSizeClass = isCompact ? ` ${MEDIA_SIZE_CLASS[mediaSize as "small" | "medium" | "large"]}` : "";

  const imageContainerEl = (
    <div
      ref={containerRef}
      data-part="box"
      className={boxSizeClass.trim() || undefined}
      {...(previewAttrs?.image ?? {})}
    >
      {animate && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 z-20 pointer-events-none ${invertedBg ? "bg-fg-on-brand" : "bg-brand"}`}
          style={barStyle}
        />
      )}
      <div className="absolute inset-0" style={imageRevealStyle}>
        <Image
          data-part="img"
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 1200px, 100vw"
        />
        {overlay && <div data-part="overlay" aria-hidden="true" />}
        {hasInsetCaption && (
          <figcaption data-part="cap-inset">
            <p {...(previewAttrs?.caption ?? {})}>{caption}</p>
          </figcaption>
        )}
      </div>

      {/* Expand hint — visible on hover when lightbox is enabled */}
      {lightbox && (
        <div
          aria-hidden="true"
          data-part="expand"
          className="rounded-ot-control p-1.5 bg-canvas/75 backdrop-blur-sm text-fg opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:transition-opacity motion-safe:duration-150 pointer-events-none"
        >
          <Maximize2 className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  return (
    <>
      <figure
        data-part="figure"
        data-kind="image"
        data-frame={frame ?? "none"}
        data-shadow={shadow ? "yes" : "no"}
        data-ratio={ratio ?? "16:9"}
        data-fit={effectiveObjectFit}
        data-color={invertedBg ? "brand" : undefined}
        data-compact={isCompact ? "" : undefined}
      >
        <div data-part="frame">
          {lightbox ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={`View full size${alt ? `: ${alt}` : ''}`}
              className={`${isCompact ? "inline-block " : "block w-full "}text-left group cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
            >
              {imageContainerEl}
            </button>
          ) : (
            imageContainerEl
          )}
        </div>

        {hasBelowCaption && (
          <figcaption data-part="cap-below">
            <p {...(previewAttrs?.caption ?? {})}>{caption}</p>
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
          className="fixed inset-0 z-9999 bg-canvas/95 backdrop-blur-md"
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
            className="absolute top-4 right-4 z-10 rounded-ot-control p-2 bg-surface/80 hover:bg-surface text-fg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X className="w-5 h-5" />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
