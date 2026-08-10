---
id: ResizeError
title: ResizeError
---

# Interface: ResizeError

Defined in: [calendar/types.ts:200](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L200)

## Properties

### attemptedEnd?

```ts
optional attemptedEnd: string;
```

Defined in: [calendar/types.ts:208](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L208)

***

### attemptedStart?

```ts
optional attemptedStart: string;
```

Defined in: [calendar/types.ts:207](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L207)

***

### conflicts?

```ts
optional conflicts: AvailabilityConflict[];
```

Defined in: [calendar/types.ts:210](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L210)

***

### eventId

```ts
eventId: string;
```

Defined in: [calendar/types.ts:201](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L201)

***

### eventTitle

```ts
eventTitle: string;
```

Defined in: [calendar/types.ts:202](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L202)

***

### message

```ts
message: string;
```

Defined in: [calendar/types.ts:204](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L204)

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/types.ts:206](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L206)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/types.ts:205](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L205)

***

### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

Defined in: [calendar/types.ts:203](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L203)
