import { stableId } from "@/lib/stableId";
import { RichText } from '@optimizely/cms-sdk/react/richText'
import PrimaryTextDepth3D from './PrimaryTextDepth3D.client'
import PrimaryTextFx from './PrimaryTextFx.client'

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

/**
 * Header effect applied to the heading. One consolidated, marketer-facing set —
 * every option is token-derived (works on any color scheme) and handles both
 * dark and light mode. Most impactful at headline scale and up.
 *   gradient          — static brand→accent diagonal fill (background-clip:text)
 *   animatedGradient  — the same fill, animated as a slow shimmer/sweep
 *   depth3d           — hard isometric 3D offset shadow stack ("pop-out")
 *   glitch            — chromatic smear: RGB-split ghosts + vertical motion streaks
 *   outline           — hollow wire letterforms with brand stroke + glow
 *   neon              — retro-disco glowing tube (dual-tone brand+accent, buzz flicker)
 *   highlight         — accent marker swipe behind the text (inline)
 *   glow              — backlit aurora halo
 */
export type HeaderEffect =
  | "none" | "gradient" | "animatedGradient" | "depth3d"
  | "glitch" | "outline" | "neon" | "highlight" | "glow";

export type PrimaryTextStyleOptions = {
  /** Horizontal alignment of the content column within the section */
  alignment?: "left" | "center";
  /** Background color of the block — "none" is transparent, inheriting the row/section background */
  color?: "none" | "brand" | "canvas" | "surface";
  /** Heading scale — controls font size, weight, tracking, and vertical rhythm */
  size?: "display" | "headline" | "title" | "label";
  /** Header effect on the heading (see HeaderEffect). */
  effect?: HeaderEffect;
};

// Visual styling lives in text.css (imported from app/globals.css), keyed on the data attributes below.
// The effect is driven by data-effect, so the old .ot-fx-* / .ot-depth-* classes are no longer added here.

// ─── Component ───────────────────────────────────────────────────────────────

export type PrimaryTextBlockProps = {
  eyebrow?: string;
  headline: string;
  headingLevel?: 'h1' | 'h2';
  body?: Parameters<typeof RichText>[0]['content'] | null;
  styleOptions?: PrimaryTextStyleOptions;
  pa?: (prop?: string | { key: string }) => Record<string, string | undefined>;
};

export default function PrimaryTextBlock({
  eyebrow,
  headline,
  headingLevel = 'h2',
  body,
  styleOptions = {},
  pa = () => ({}),
}: PrimaryTextBlockProps) {
  const {
    alignment = "left",
    color     = "canvas",
    size      = "headline",
    effect    = "none",
  } = styleOptions;

  const Heading = headingLevel
  const headingId = stableId("text", `${eyebrow ?? ""}|${headline}`)
  const isHighlight = effect === 'highlight'
  const isDepth3d = effect === 'depth3d'
  const needsText = effect === 'glitch' || effect === 'outline'

  // depth3d renders real stacked DOM layers; highlight wraps the text in a span the client hook splits per line
  // (keyed on the headline so a CMS edit remounts it instead of reconciling over the split nodes).
  const headingChildren = isHighlight
    ? <span key={headline} data-part="mark" suppressHydrationWarning>{headline}</span>
    : isDepth3d
      ? <PrimaryTextDepth3D text={headline} />
      : headline

  const animated = effect !== 'none'

  return (
    <section
      data-block="text"
      data-size={size}
      data-color={color}
      data-effect={effect}
      data-align={alignment}
      data-animate={animated ? '' : undefined}
      // brand fill is always dark: assert dark theme so nested tokens resolve correctly.
      data-theme={color === 'brand' ? 'dark' : undefined}
      aria-labelledby={headingId}
    >
      <div data-part="inner">
        <div data-part="stack">
          {eyebrow && <p data-part="eyebrow" {...pa('eyebrow')}>{eyebrow}</p>}
          <Heading
            id={headingId}
            data-part="headline"
            {...(needsText ? { 'data-text': headline } : {})}
            {...(effect === 'animatedGradient' || effect === 'neon' ? { 'data-pause-offscreen': '' } : {})}
            {...pa('headline')}
          >
            {headingChildren}
          </Heading>
          {body && (
            <div data-part="body" data-rich-text="" {...pa('body')}>
              <RichText content={body} />
            </div>
          )}
        </div>
      </div>
      {animated && <PrimaryTextFx effect={effect} headline={headline} />}
    </section>
  );
}
