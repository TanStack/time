---
id: SegmentInfo
title: SegmentInfo
---

# Interface: SegmentInfo

Defined in: [calendar/getResizeProps.ts:214](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L214)

Information about a segment's position within a multi-day event

## Properties

### isFirstSegment

```ts
isFirstSegment: boolean;
```

Defined in: [calendar/getResizeProps.ts:216](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L216)

Whether this is the first segment of a multi-day event

***

### isLastSegment

```ts
isLastSegment: boolean;
```

Defined in: [calendar/getResizeProps.ts:218](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L218)

Whether this is the last segment of a multi-day event

***

### isSplitEvent

```ts
isSplitEvent: boolean;
```

Defined in: [calendar/getResizeProps.ts:220](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L220)

Whether this segment is part of a split multi-day event

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/getResizeProps.ts:224](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L224)

The original event end (before splitting)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/getResizeProps.ts:222](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L222)

The original event start (before splitting)

***

### segmentEnd

```ts
segmentEnd: string;
```

Defined in: [calendar/getResizeProps.ts:228](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L228)

The segment's end time

***

### segmentStart

```ts
segmentStart: string;
```

Defined in: [calendar/getResizeProps.ts:226](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L226)

The segment's start time
