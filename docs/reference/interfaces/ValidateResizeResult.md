---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:335](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L335)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:336](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L336)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:337](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L337)

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

Defined in: [calendar/calendar.ts:342](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L342)

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

Defined in: [calendar/calendar.ts:347](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L347)
