---
id: SegmentResizePreview
title: SegmentResizePreview
---

# Interface: SegmentResizePreview

Defined in: [calendar/getResizeProps.ts:263](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L263)

Result of resize preview calculation for a segment

## Properties

### hasChanged

```ts
hasChanged: boolean;
```

Defined in: [calendar/getResizeProps.ts:269](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L269)

Whether the preview has changed from the original

***

### previewStyle

```ts
previewStyle: PositionStyle | null;
```

Defined in: [calendar/getResizeProps.ts:267](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L267)

The preview style to apply, if any

***

### shouldHide

```ts
shouldHide: boolean;
```

Defined in: [calendar/getResizeProps.ts:265](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L265)

Whether the segment should be hidden (shrunk away)
