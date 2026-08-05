---
id: ResizeError
title: ResizeError
---

# Interface: ResizeError

Defined in: [calendar/types.ts:163](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L163)

## Properties

### attemptedEnd?

```ts
optional attemptedEnd: string;
```

Defined in: [calendar/types.ts:171](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L171)

***

### attemptedStart?

```ts
optional attemptedStart: string;
```

Defined in: [calendar/types.ts:170](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L170)

***

### conflicts?

```ts
optional conflicts: AvailabilityConflict[];
```

Defined in: [calendar/types.ts:173](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L173)

***

### eventId

```ts
eventId: string;
```

Defined in: [calendar/types.ts:164](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L164)

***

### eventTitle

```ts
eventTitle: string;
```

Defined in: [calendar/types.ts:165](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L165)

***

### message

```ts
message: string;
```

Defined in: [calendar/types.ts:167](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L167)

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/types.ts:169](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L169)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/types.ts:168](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L168)

***

### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

Defined in: [calendar/types.ts:166](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L166)
