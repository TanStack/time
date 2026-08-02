---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:330](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L330)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:331](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L331)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:332](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L332)

#### conflicts

```ts
conflicts: AvailabilityConflict[];
```

#### message

```ts
message: string;
```

#### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

***

### result

```ts
result: object;
```

Defined in: [calendar/calendar.ts:337](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L337)

#### durationMinutes

```ts
durationMinutes: number;
```

#### end

```ts
end: string;
```

#### start

```ts
start: string;
```

***

### targetDayDate

```ts
targetDayDate: string;
```

Defined in: [calendar/calendar.ts:342](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L342)
