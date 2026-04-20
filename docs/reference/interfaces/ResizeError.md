---
id: ResizeError
title: ResizeError
---

# Interface: ResizeError

Defined in: [calendar/types.ts:179](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L179)

Error information when a resize operation is blocked

## Properties

### attemptedEnd?

```ts
optional attemptedEnd: string;
```

Defined in: [calendar/types.ts:187](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L187)

***

### attemptedStart?

```ts
optional attemptedStart: string;
```

Defined in: [calendar/types.ts:186](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L186)

***

### conflicts?

```ts
optional conflicts: AvailabilityConflict[];
```

Defined in: [calendar/types.ts:189](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L189)

Specific availability conflicts that prevented the resize

***

### eventId

```ts
eventId: string;
```

Defined in: [calendar/types.ts:180](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L180)

***

### eventTitle

```ts
eventTitle: string;
```

Defined in: [calendar/types.ts:181](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L181)

***

### message

```ts
message: string;
```

Defined in: [calendar/types.ts:183](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L183)

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/types.ts:185](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L185)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/types.ts:184](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L184)

***

### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

Defined in: [calendar/types.ts:182](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L182)
