---
id: SegmentResizePreview
title: SegmentResizePreview
---

# Interface: SegmentResizePreview

Defined in: [calendar/getResizeProps.ts:274](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L274)

Result of resize preview calculation for a segment

## Properties

### hasChanged

```ts
hasChanged: boolean;
```

Defined in: [calendar/getResizeProps.ts:280](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L280)

Whether the preview has changed from the original

***

### previewStyle

```ts
previewStyle: PositionStyle | null;
```

Defined in: [calendar/getResizeProps.ts:278](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L278)

The preview style to apply, if any

***

### shouldHide

```ts
shouldHide: boolean;
```

Defined in: [calendar/getResizeProps.ts:276](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L276)

Whether the segment should be hidden (shrunk away)
