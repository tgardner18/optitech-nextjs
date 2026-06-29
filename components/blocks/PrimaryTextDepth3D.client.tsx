// ─── depth3d static layered headline ─────────────────────────────────────────
//
// Renders the "3D Depth" header effect as real stacked DOM layers (see the
// .ot-extrude3d styles in globals.css): a bright face over evenly-stepped
// receding duplicates that trail DOWN-LEFT, each a distinct token-derived shade
// carrying a ridge stroke so the steps read as clearly separated layers (the
// retro multi-layer extrude look).
//
// Fully static — no JavaScript, no cursor tracking (the earlier hover-lean was
// removed). Server-rendered; reduced-motion safe by construction (nothing moves).
//
// No @optimizely/cms-sdk import — pure presentational component.

const LAYER_COUNT = 6 // 5 receding steps + 1 face (matches the CSS nth-child geometry)

export default function PrimaryTextDepth3D({ text }: { text: string }) {
  return (
    <span className="ot-extrude3d">
      <span className="ot-extrude3d__rot">
        {Array.from({ length: LAYER_COUNT }).map((_, i) => (
          <span
            key={i}
            className="ot-extrude3d__layer"
            // Only the face (last layer) is exposed to assistive tech; the
            // receding duplicates are decorative.
            aria-hidden={i < LAYER_COUNT - 1 ? true : undefined}
          >
            {text}
          </span>
        ))}
      </span>
    </span>
  )
}
