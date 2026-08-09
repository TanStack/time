---
id: EventError
title: EventError
---

# Interface: EventError

Defined in: [calendar/types.ts:183](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L183)

## Properties

### attemptedEnd?

```ts
optional attemptedEnd: string;
```

Defined in: [calendar/types.ts:191](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L191)

***

### attemptedStart?

```ts
optional attemptedStart: string;
```

Defined in: [calendar/types.ts:190](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L190)

***

### conflicts?

```ts
optional conflicts: AvailabilityConflict[];
```

Defined in: [calendar/types.ts:193](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L193)

***

### eventId

```ts
eventId: string;
```

Defined in: [calendar/types.ts:184](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L184)

***

### eventTitle

```ts
eventTitle: string;
```

Defined in: [calendar/types.ts:185](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L185)

***

### message

```ts
message: string;
```

Defined in: [calendar/types.ts:187](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L187)

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/types.ts:189](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L189)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/types.ts:188](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L188)

***

### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

Defined in: [calendar/types.ts:186](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L186)
