"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VideoStyleOptions = {
  /** Lock to a specific aspect ratio — no value defaults to 16:9 */
  ratio?: "16:9" | "4:3" | "3:2" | "1:1";
  /** Teal brand wash over the poster thumbnail */
  overlay?: boolean;
  /**
   * Frame treatment (mirrors ImageBlock):
   * "offset" — bold editorial teal backing block, 12px strip right/bottom.
   * "glow"   — inset teal edge glow + outer ambient bloom.
   */
  frame?: "offset" | "glow";
  /** "inset" floats the caption over the image bottom-left; "below" places it beneath */
  captionPosition?: "inset" | "below";
  /** Dual-source chromatic bloom shadow — teal left, signal green right */
  shadow?: boolean;
};

export type VideoBlockProps = {
  /** Full YouTube or Vimeo URL */
  src: string;
  /** Accessible title for the iframe — required */
  title: string;
  caption?: string;
  styleOptions?: VideoStyleOptions;
  previewAttrs?: Record<string, Record<string, string | undefined>>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type VideoMeta =
  | { platform: "youtube"; id: string }
  | { platform: "vimeo";   id: string }
  | null;

function parseSrc(src: string): VideoMeta {
  // YouTube — handles watch, short URL, embed, and Shorts
  const ytLong  = src.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  const ytShort = src.match(/(?:youtu\.be\/|youtube\.com\/(?:embed|shorts)\/)([A-Za-z0-9_-]{11})/);
  const ytId    = (ytLong ?? ytShort)?.[1];
  if (ytId) return { platform: "youtube", id: ytId };

  // Vimeo — handles vimeo.com/{id}, channels, groups, and player subdomain
  const vmMatch = src.match(
    /(?:vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?|player\.vimeo\.com\/video\/)(\d+)/
  );
  if (vmMatch) return { platform: "vimeo", id: vmMatch[1] };

  return null;
}

function buildEmbedUrl(meta: VideoMeta): string {
  if (!meta) return "";
  if (meta.platform === "youtube")
    return `https://www.youtube-nocookie.com/embed/${meta.id}?autoplay=1&rel=0&modestbranding=1`;
  return `https://player.vimeo.com/video/${meta.id}?autoplay=1`;
}

const RATIO_CLASS: Record<NonNullable<VideoStyleOptions["ratio"]>, string> = {
  "16:9": "aspect-video",
  "4:3":  "aspect-4/3",
  "3:2":  "aspect-3/2",
  "1:1":  "aspect-square",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function VideoBlock({
  src,
  title,
  caption,
  styleOptions = {},
  previewAttrs,
}: VideoBlockProps) {
  const {
    ratio,
    overlay         = false,
    frame,
    captionPosition = "inset",
    shadow          = false,
  } = styleOptions;

  const meta = parseSrc(src);

  const [posterSrc,  setPosterSrc]  = useState<string | null>(null);
  const [thumbState, setThumbState] = useState<"loading" | "ready" | "error">("loading");
  const [playing,    setPlaying]    = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch thumbnail based on platform
  useEffect(() => {
    setPlaying(false);
    setPosterSrc(null);
    setThumbState("loading");

    const parsed = parseSrc(src);
    if (!parsed) { setThumbState("error"); return; }

    if (parsed.platform === "youtube") {
      // Reliable hq thumbnail; onError handler below upgrades to maxres when available
      setPosterSrc(`https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`);
      setThumbState("ready");
    } else {
      // Vimeo requires an API round-trip for the thumbnail
      let cancelled = false;
      fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(src)}`)
        .then((r) => r.json())
        .then((data: { thumbnail_url?: string }) => {
          if (cancelled) return;
          const raw = data.thumbnail_url ?? "";
          // Bump to a larger resolution when available
          setPosterSrc(raw.replace(/_\d+$/, "_1280"));
          setThumbState("ready");
        })
        .catch(() => { if (!cancelled) setThumbState("error"); });
      return () => { cancelled = true; };
    }
  }, [src]);

  // Shift focus into the iframe once it mounts
  useEffect(() => {
    if (playing) requestAnimationFrame(() => iframeRef.current?.focus());
  }, [playing]);

  const aspectClass = ratio ? RATIO_CLASS[ratio] : "aspect-video";

  const glowStyle: React.CSSProperties =
    frame === "glow"
      ? {
          boxShadow:
            "inset 0 0 0 2px var(--ot-bloom-brand-ring), " +
            "0 0 0 1px var(--ot-bloom-brand-border), " +
            "0 0 0 2px var(--ot-bloom-accent-border), " +
            "0 0 52px var(--ot-bloom-brand-faint), " +
            "0 20px 72px var(--ot-bloom-accent-faint)",
        }
      : {};

  /*
   * Shadow bloom — brand pools bottom-left, accent pools bottom-right.
   * isolation: isolate on the figure paints this between the page and the
   * container, not behind the entire page.
   */
  const shadowStyle: React.CSSProperties = {
    position:   "absolute",
    left:       "6%",
    right:      "6%",
    top:        "28%",
    bottom:     "-28px",
    background:
      "radial-gradient(ellipse at 22% 100%, var(--ot-bloom-brand)  0%, transparent 58%), " +
      "radial-gradient(ellipse at 78% 100%, var(--ot-bloom-accent) 0%, transparent 58%)",
    filter:    "blur(52px)",
    transform: "scaleX(0.86)",
    zIndex:    -1,
  };

  const hasInsetCaption = caption && captionPosition === "inset";
  const hasBelowCaption = caption && captionPosition === "below";

  return (
    <figure className={`relative w-full${shadow ? " isolate pb-7" : ""}`}>

      {/* Chromatic shadow bloom */}
      {shadow && <div aria-hidden="true" style={shadowStyle} />}

      {/* Offset frame outer wrapper */}
      <div className={frame === "offset" ? "relative pr-3 pb-3" : ""}>
        {frame === "offset" && (
          <div
            aria-hidden="true"
            className="absolute top-3 left-3 right-0 bottom-0 bg-brand rounded-ot-surface"
          />
        )}

        {/* Aspect-ratio container */}
        <div
          className={`relative overflow-hidden rounded-ot-surface ${aspectClass}${frame === "offset" ? " z-10" : ""}`}
          style={glowStyle}
        >
          {playing ? (

            /* ── Live embed ──────────────────────────────────────────────── */
            <iframe
              ref={iframeRef}
              src={buildEmbedUrl(meta)}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />

          ) : (

            /* ── Poster state ─────────────────────────────────────────────── */
            <>
              {/* Thumbnail or shimmer */}
              {thumbState === "loading" && (
                <div className="absolute inset-0 bg-surface animate-pulse" />
              )}
              {thumbState === "error" && (
                <div className="absolute inset-0 bg-surface" />
              )}
              {thumbState === "ready" && posterSrc && (
                <Image
                  src={posterSrc}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  onError={() => {
                    // YouTube: try maxresdefault if hqdefault fails (rare)
                    if (meta?.platform === "youtube" && posterSrc.includes("hqdefault")) {
                      setPosterSrc(`https://img.youtube.com/vi/${meta.id}/maxresdefault.jpg`);
                    } else {
                      setThumbState("error");
                    }
                  }}
                />
              )}

              {/* Dark scrim — ensures play button legibility regardless of thumbnail brightness */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, oklch(from var(--ot-canvas) l c h / 0.65) 0%, oklch(from var(--ot-canvas) l c h / 0.25) 45%, transparent 100%)",
                }}
              />

              {/* Optional teal brand wash */}
              {overlay && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:   "var(--ot-brand)",
                    opacity:      0.4,
                    mixBlendMode: "multiply",
                  }}
                />
              )}

              {/* Play button */}
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play: ${title}`}
                className="absolute inset-0 flex items-center justify-center group/play focus-visible:outline-none"
              >
                {/* Brand square — sharp-cornered, default-theme-native.
                    Focus indicator rides the button's focus-visible state via
                    group/play so the ring frames the square, not the whole poster. */}
                <span
                  className={[
                    "relative flex items-center justify-center w-16 h-16",
                    "bg-brand",
                    "motion-safe:transition-[transform,background-color]",
                    "motion-safe:duration-200 motion-safe:ease-quick",
                    "group-hover/play:bg-brand-hover",
                    "motion-safe:group-hover/play:scale-110",
                    "group-focus-visible/play:ring-2 group-focus-visible/play:ring-fg-on-brand",
                    "group-focus-visible/play:ring-offset-2 group-focus-visible/play:ring-offset-transparent",
                  ].join(" ")}
                >
                  {/* Play triangle */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-6 h-6 translate-x-0.5"
                  >
                    <path
                      d="M6 4.5L20 12L6 19.5V4.5Z"
                      fill="var(--ot-fg-on-brand)"
                    />
                  </svg>
                </span>
              </button>

              {/* Inset caption — floats over bottom-left, clips with the poster */}
              {hasInsetCaption && (
                <figcaption className="absolute bottom-0 left-0 z-10 bg-canvas/90 px-sm py-xs max-w-[70%]">
                  <p className="text-label text-fg-muted leading-snug" {...(previewAttrs?.caption ?? {})}>{caption}</p>
                </figcaption>
              )}
            </>
          )}
        </div>
      </div>

      {/* Below caption */}
      {hasBelowCaption && (
        <figcaption className="mt-sm">
          <p className="text-label text-fg-muted" {...(previewAttrs?.caption ?? {})}>{caption}</p>
        </figcaption>
      )}
    </figure>
  );
}
