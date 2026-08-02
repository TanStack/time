---
id: ResizeError
title: ResizeError
---

# Interface: ResizeError

Defined in: [calendar/types.ts:216](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L216)

Error information when a resize operation is blocked

## Properties

### attemptedEnd?

```ts
optional attemptedEnd: string;
```

Defined in: [calendar/types.ts:224](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L224)

***

### attemptedStart?

```ts
optional attemptedStart: string;
```

Defined in: [calendar/types.ts:223](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L223)

***

### conflicts?

```ts
optional conflicts: AvailabilityConflict[];
```

Defined in: [calendar/types.ts:226](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L226)

Specific availability conflicts that prevented the resize

***

### eventId

```ts
eventId: string;
```

Defined in: [calendar/types.ts:217](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L217)

***

### eventTitle

```ts
eventTitle: string;
```

Defined in: [calendar/types.ts:218](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L218)

***

### message

```ts
message: string;
```

Defined in: [calendar/types.ts:220](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L220)

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/types.ts:222](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L222)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/types.ts:221](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L221)

***

### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

Defined in: [calendar/types.ts:219](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L219)
