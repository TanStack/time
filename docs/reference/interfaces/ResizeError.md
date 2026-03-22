---
id: ResizeError
title: ResizeError
---

# Interface: ResizeError

Defined in: [calendar/types.ts:128](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L128)

Error information when a resize operation is blocked

## Properties

### attemptedEnd?

```ts
optional attemptedEnd: string;
```

Defined in: [calendar/types.ts:136](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L136)

***

### attemptedStart?

```ts
optional attemptedStart: string;
```

Defined in: [calendar/types.ts:135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L135)

***

### conflicts?

```ts
optional conflicts: AvailabilityConflict[];
```

Defined in: [calendar/types.ts:138](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L138)

Specific availability conflicts that prevented the resize

***

### eventId

```ts
eventId: string;
```

Defined in: [calendar/types.ts:129](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L129)

***

### eventTitle

```ts
eventTitle: string;
```

Defined in: [calendar/types.ts:130](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L130)

***

### message

```ts
message: string;
```

Defined in: [calendar/types.ts:132](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L132)

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/types.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L134)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/types.ts:133](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L133)

***

### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

Defined in: [calendar/types.ts:131](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L131)
