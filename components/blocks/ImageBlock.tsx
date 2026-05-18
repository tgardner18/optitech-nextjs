"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

export type ImageStyleOptions = {
  /** Lock to a specific aspect ratio — no value renders at the natural image proportion */
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
};

export type ImageBlockProps = {
  src: string;
  alt: string;
  caption?: string;
  styleOptions?: ImageStyleOptions;
};

// ─── Aspect ratio map ─────────────────────────────────────────────────────────

const RATIO_CLASS: Record<NonNullable<ImageStyleOptions["ratio"]>, string> = {
  "16:9": "aspect-video",
  "4:3":  "aspect-4/3",
  "3:2":  "aspect-3/2",
  "1:1":  "aspect-square",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ImageBlock({
  src,
  alt,
  caption,
  styleOptions = {},
}: ImageBlockProps) {
  const {
    ratio,
    overlay         = false,
    frame,
    animate         = false,
    captionPosition = "inset",
    shadow          = false,
  } = styleOptions;

  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!animate) return;

    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
  }, [animate]);

  const aspectClass = ratio ? RATIO_CLASS[ratio] : "aspect-video";

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
   * Glow frame: inset brand ring defines the image boundary; outer bloom lifts
   * the image off the surface as if backlit. No additional wrapper element needed.
   */
  const glowStyle: React.CSSProperties = frame === "glow"
    ? {
        boxShadow:
          "inset 0 0 0 2px var(--ot-bloom-brand-ring), " +
          "0 0 0 1px var(--ot-bloom-brand-border), " +
          "0 0 52px var(--ot-bloom-brand-faint)",
      }
    : {};

  return (
    <figure className={`relative${shadow ? " isolate pb-7" : ""}`}>

      {/* Chromatic shadow bloom — teal left, signal green right */}
      {shadow && <div aria-hidden="true" style={shadowStyle} />}

      {/*
        * Offset frame: outer wrapper adds 12px of space on the right and bottom.
        * A teal backing block sits at (12px, 12px), creating a bold editorial
        * mounting-board effect — the image floats above a teal backing.
        */}
      <div className={frame === "offset" ? "relative pr-3 pb-3" : ""}>
        {frame === "offset" && (
          <div
            aria-hidden="true"
            className="absolute top-3 left-3 right-0 bottom-0 bg-brand"
          />
        )}

        {/* Image container — glow applies here as an inline box-shadow */}
        <div
          ref={containerRef}
          className={`relative overflow-hidden ${aspectClass}${frame === "offset" ? " z-10" : ""}`}
          style={glowStyle}
        >
          {/* Teal bar — leads the reveal, exits right before image appears */}
          {animate && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-brand z-20 pointer-events-none"
              style={barStyle}
            />
          )}

          {/* Image + overlay + inset caption — all clip together during reveal */}
          <div className="absolute inset-0" style={imageRevealStyle}>
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              sizes="(min-width: 1280px) 1200px, 100vw"
            />

            {/* Teal brand wash — multiply blend works best on light-toned imagery */}
            {overlay && (
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "var(--ot-brand)",
                  opacity: 0.4,
                  mixBlendMode: "multiply",
                }}
              />
            )}

            {/* Inset caption badge — floats over bottom-left */}
            {hasInsetCaption && (
              <figcaption className="absolute bottom-0 left-0 z-10 bg-canvas/90 px-sm py-xs max-w-[70%]">
                <p className="text-label text-fg-muted leading-snug">{caption}</p>
              </figcaption>
            )}
          </div>
        </div>
      </div>

      {/* Below caption — label-scale text under image */}
      {hasBelowCaption && (
        <figcaption className="mt-sm">
          <p className="text-label text-fg-muted">{caption}</p>
        </figcaption>
      )}
    </figure>
  );
}
