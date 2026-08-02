---
id: LayoutOptions
title: LayoutOptions
---

# Interface: LayoutOptions

Defined in: [projection/layout.ts:59](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L59)

## Properties

### cascadeOffset?

```ts
optional cascadeOffset: number;
```

Defined in: [projection/layout.ts:69](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L69)

`cascade` only: inset per depth level as a fraction of the track.

***

### minCrossSize?

```ts
optional minCrossSize: number;
```

Defined in: [projection/layout.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L71)

`cascade` only: smallest cross-axis size an event may shrink to.

***

### strategy?

```ts
optional strategy: 
  | OverlapStrategy
  | LayoutStrategyFn;
```

Defined in: [projection/layout.ts:67](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L67)

How concurrent events share the cross axis. Pass a name for a built-in, or your own
function of the overlap facts.
- `columns`: equal side-by-side slices (default)
- `expand`: like `columns`, but each event absorbs the free slices next to it
- `cascade`: each concurrent event is inset and narrower, stacked on top
