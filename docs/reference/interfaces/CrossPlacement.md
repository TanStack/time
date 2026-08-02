---
id: CrossPlacement
title: CrossPlacement
---

# Interface: CrossPlacement

Defined in: [projection/layout.ts:41](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L41)

## Properties

### crossSize

```ts
crossSize: number;
```

Defined in: [projection/layout.ts:45](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L45)

Size on the cross axis as a fraction of the track (0-1).

***

### crossStart

```ts
crossStart: number;
```

Defined in: [projection/layout.ts:43](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L43)

Offset on the cross axis as a fraction of the track (0-1).

***

### zIndex?

```ts
optional zIndex: number;
```

Defined in: [projection/layout.ts:50](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L50)

Paint order; higher sits on top. Omit to leave stacking to CSS — a strategy that overlays
events must return it for every event, including the bottom one, or CSS decides the order.
