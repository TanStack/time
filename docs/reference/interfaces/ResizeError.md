---
id: ResizeError
title: ResizeError
---

# Interface: ResizeError

Defined in: [calendar/types.ts:189](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L189)

Error information when a resize operation is blocked

## Properties

### attemptedEnd?

```ts
optional attemptedEnd: string;
```

Defined in: [calendar/types.ts:197](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L197)

***

### attemptedStart?

```ts
optional attemptedStart: string;
```

Defined in: [calendar/types.ts:196](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L196)

***

### conflicts?

```ts
optional conflicts: AvailabilityConflict[];
```

Defined in: [calendar/types.ts:199](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L199)

Specific availability conflicts that prevented the resize

***

### eventId

```ts
eventId: string;
```

Defined in: [calendar/types.ts:190](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L190)

***

### eventTitle

```ts
eventTitle: string;
```

Defined in: [calendar/types.ts:191](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L191)

***

### message

```ts
message: string;
```

Defined in: [calendar/types.ts:193](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L193)

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/types.ts:195](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L195)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/types.ts:194](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L194)

***

### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

Defined in: [calendar/types.ts:192](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L192)
