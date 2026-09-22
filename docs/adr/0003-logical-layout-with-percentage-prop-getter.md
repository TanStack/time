# Logical layout in the core; percentage prop-getter for positioning

## Status

accepted

## Context

The calendar code computes pixel geometry: `getUnavailableRanges(containerHeight) → {top,
height}`, `getTimelineLayout() → {left, width}` in px, and pixel-based `getEventProps`. That
makes the core a layout engine with baked-in assumptions (vertical, LTR, non-virtualized),
which is what makes calendar libraries hard to restyle. We still want an *easy* way to
position events, just not ready-made styles.

## Decision

The core/projection emits **logical layout only**: per event `{ startFraction, endFraction,
column, columnCount }` (and `lane` for timelines), plus overlap resolution (interval-graph
coloring) — the genuinely hard part the library owns.

A **prop-getter** `getEventProps(event)` (TanStack idiom) returns a **percentage-based,
`style`-ready object** the consumer spreads directly — no container dimensions required,
responsive and zoom-proof via CSS. Orientation (vertical day/week vs horizontal timeline) is
a view config that maps the time axis to `top/height` or `left/width`. The prop-getter lives
with the **view**, not the feature-agnostic kernel, which stays pixel- and dimension-free.

Minimum visible size for tiny events is the consumer's CSS (`min-height`), not injected
pixels. A pixel helper, if ever needed, is a separate opt-in module.

## Considered Options

- **Pixel layout engine** (keep `containerHeight`/px outputs) — rejected: bakes in geometry
  assumptions; the react-big-calendar restyling trap.
- **CSS-Grid coordinates** (`gridRowStart`/`gridColumn`) — rejected: forces a grid model and
  is awkward for sub-slot precision.

## Consequences

- `getUnavailableRanges` drops its `containerHeight` parameter; `getTimelineLayout` and
  `getEventProps` return percentages/fractions, not pixels.
- Raw logical fields stay public for power users (canvas/virtualized rendering).
