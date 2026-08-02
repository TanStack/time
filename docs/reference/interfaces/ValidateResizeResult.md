---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:325](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L325)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:326](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L326)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:327](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L327)

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

Defined in: [calendar/calendar.ts:332](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L332)

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

Defined in: [calendar/calendar.ts:337](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L337)
