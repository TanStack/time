---
id: SegmentResizePreview
title: SegmentResizePreview
---

# Interface: SegmentResizePreview

Defined in: [calendar/getResizeProps.ts:275](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L275)

Result of resize preview calculation for a segment

## Properties

### hasChanged

```ts
hasChanged: boolean;
```

Defined in: [calendar/getResizeProps.ts:281](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L281)

Whether the preview has changed from the original

***

### previewStyle

```ts
previewStyle: PositionStyle | null;
```

Defined in: [calendar/getResizeProps.ts:279](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L279)

The preview style to apply, if any

***

### shouldHide

```ts
shouldHide: boolean;
```

Defined in: [calendar/getResizeProps.ts:277](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L277)

Whether the segment should be hidden (shrunk away)
