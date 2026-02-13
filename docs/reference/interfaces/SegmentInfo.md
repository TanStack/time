---
id: SegmentInfo
title: SegmentInfo
---

# Interface: SegmentInfo

Defined in: [calendar/getResizeProps.ts:202](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L202)

Information about a segment's position within a multi-day event

## Properties

### isFirstSegment

```ts
isFirstSegment: boolean;
```

Defined in: [calendar/getResizeProps.ts:204](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L204)

Whether this is the first segment of a multi-day event

***

### isLastSegment

```ts
isLastSegment: boolean;
```

Defined in: [calendar/getResizeProps.ts:206](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L206)

Whether this is the last segment of a multi-day event

***

### isSplitEvent

```ts
isSplitEvent: boolean;
```

Defined in: [calendar/getResizeProps.ts:208](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L208)

Whether this segment is part of a split multi-day event

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/getResizeProps.ts:212](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L212)

The original event end (before splitting)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/getResizeProps.ts:210](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L210)

The original event start (before splitting)

***

### segmentEnd

```ts
segmentEnd: string;
```

Defined in: [calendar/getResizeProps.ts:216](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L216)

The segment's end time

***

### segmentStart

```ts
segmentStart: string;
```

Defined in: [calendar/getResizeProps.ts:214](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L214)

The segment's start time
