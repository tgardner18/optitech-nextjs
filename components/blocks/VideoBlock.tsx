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
  /** True when rendered on a brand-colored background — inverts frame accents to fg-on-brand */
  invertedBg?: boolean;
};

export type VideoBlockProps = {
  /** Full YouTube or Vimeo URL */
  src: string;
  /** Accessible title for the iframe — required */
  title: string;
  caption?: string;
  styleOptions?: VideoStyleOptions;
  previewAttrs?: Record<string, Record<string, string | undefined>>;
  /** @deprecated No longer used. Video keeps its aspect ratio (see media.css). */
  fillHeight?: boolean;
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
    invertedBg      = false,
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
      // Try maxres first (sharp at full width); onLoad/onError below fall back to hq
      setPosterSrc(`https://img.youtube.com/vi/${parsed.id}/maxresdefault.jpg`);
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

  const hasInsetCaption = caption && captionPosition === "inset";
  const hasBelowCaption = caption && captionPosition === "below";

  return (
    <figure
      data-part="figure"
      data-kind="video"
      data-frame={frame ?? "none"}
      data-shadow={shadow ? "yes" : "no"}
      data-ratio={ratio ?? "16:9"}
      data-color={invertedBg ? "brand" : undefined}
      data-caption={hasInsetCaption ? "inset" : undefined}
    >
      <div data-part="frame">
        <div data-part="box">
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
              {thumbState === "loading" && (
                <div className="absolute inset-0 bg-surface animate-pulse" />
              )}
              {thumbState === "error" && (
                <div className="absolute inset-0 bg-surface" />
              )}
              {thumbState === "ready" && posterSrc && (
                <Image
                  data-part="img"
                  src={posterSrc}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  onLoad={(e) => {
                    // YouTube serves a 120px grey placeholder (not a 404) when a video has no
                    // maxres thumbnail, so judge by size, not by an error event.
                    if (
                      meta?.platform === "youtube" &&
                      posterSrc.includes("maxresdefault") &&
                      e.currentTarget.naturalWidth <= 200
                    ) {
                      setPosterSrc(`https://img.youtube.com/vi/${meta.id}/hqdefault.jpg`);
                    }
                  }}
                  onError={() => {
                    if (meta?.platform === "youtube" && posterSrc.includes("maxresdefault")) {
                      setPosterSrc(`https://img.youtube.com/vi/${meta.id}/hqdefault.jpg`);
                    } else {
                      setThumbState("error");
                    }
                  }}
                />
              )}

              {overlay && <div data-part="overlay" aria-hidden="true" />}

              {/* Neutral scrim: keeps the play button and title legible on any thumbnail, in every mode */}
              <div data-part="scrim" aria-hidden="true" />

              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play: ${title}`}
                data-part="play"
              >
                <span data-part="play-btn">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <path d="M6 4.5L20 12L6 19.5V4.5Z" fill="currentColor" />
                  </svg>
                </span>
              </button>

              {/* The video's title labels the poster for sighted visitors (the button already names it for AT) */}
              {title && (
                <p data-part="chip" aria-hidden="true">{title} <span>· Watch</span></p>
              )}

              {hasInsetCaption && (
                <figcaption data-part="cap-inset">
                  <p {...(previewAttrs?.caption ?? {})}>{caption}</p>
                </figcaption>
              )}
            </>
          )}
        </div>
      </div>

      {hasBelowCaption && (
        <figcaption data-part="cap-below">
          <p {...(previewAttrs?.caption ?? {})}>{caption}</p>
        </figcaption>
      )}
    </figure>
  );
}
