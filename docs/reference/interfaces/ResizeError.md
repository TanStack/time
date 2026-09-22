---
id: ResizeError
title: ResizeError
---

# Interface: ResizeError

Defined in: [calendar/types.ts:225](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L225)

Error information when a resize operation is blocked

## Properties

### attemptedEnd?

```ts
optional attemptedEnd: string;
```

Defined in: [calendar/types.ts:233](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L233)

***

### attemptedStart?

```ts
optional attemptedStart: string;
```

Defined in: [calendar/types.ts:232](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L232)

***

### conflicts?

```ts
optional conflicts: AvailabilityConflict[];
```

Defined in: [calendar/types.ts:235](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L235)

Specific availability conflicts that prevented the resize

***

### eventId

```ts
eventId: string;
```

Defined in: [calendar/types.ts:226](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L226)

***

### eventTitle

```ts
eventTitle: string;
```

Defined in: [calendar/types.ts:227](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L227)

***

### message

```ts
message: string;
```

Defined in: [calendar/types.ts:229](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L229)

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/types.ts:231](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L231)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/types.ts:230](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L230)

***

### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

Defined in: [calendar/types.ts:228](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L228)
