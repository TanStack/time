---
id: SegmentInfo
title: SegmentInfo
---

# Interface: SegmentInfo

Defined in: [calendar/getResizeProps.ts:213](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L213)

Information about a segment's position within a multi-day event

## Properties

### isFirstSegment

```ts
isFirstSegment: boolean;
```

Defined in: [calendar/getResizeProps.ts:215](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L215)

Whether this is the first segment of a multi-day event

***

### isLastSegment

```ts
isLastSegment: boolean;
```

Defined in: [calendar/getResizeProps.ts:217](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L217)

Whether this is the last segment of a multi-day event

***

### isSplitEvent

```ts
isSplitEvent: boolean;
```

Defined in: [calendar/getResizeProps.ts:219](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L219)

Whether this segment is part of a split multi-day event

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/getResizeProps.ts:223](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L223)

The original event end (before splitting)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/getResizeProps.ts:221](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L221)

The original event start (before splitting)

***

### segmentEnd

```ts
segmentEnd: string;
```

Defined in: [calendar/getResizeProps.ts:227](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L227)

The segment's end time

***

### segmentStart

```ts
segmentStart: string;
```

Defined in: [calendar/getResizeProps.ts:225](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L225)

The segment's start time
