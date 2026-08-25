---
id: EventMutationError
title: EventMutationError
---

# Interface: EventMutationError

Defined in: [calendar/types.ts:208](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L208)

## Properties

### attemptedEnd?

```ts
optional attemptedEnd: string;
```

Defined in: [calendar/types.ts:216](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L216)

***

### attemptedStart?

```ts
optional attemptedStart: string;
```

Defined in: [calendar/types.ts:215](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L215)

***

### conflicts?

```ts
optional conflicts: AvailabilityConflict[];
```

Defined in: [calendar/types.ts:220](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L220)

***

### eventId

```ts
eventId: string;
```

Defined in: [calendar/types.ts:209](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L209)

***

### eventTitle

```ts
eventTitle: string;
```

Defined in: [calendar/types.ts:210](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L210)

***

### kind?

```ts
optional kind: EventMutationKind;
```

Defined in: [calendar/types.ts:218](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L218)

***

### message

```ts
message: string;
```

Defined in: [calendar/types.ts:212](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L212)

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/types.ts:214](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L214)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/types.ts:213](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L213)

***

### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

Defined in: [calendar/types.ts:211](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L211)
