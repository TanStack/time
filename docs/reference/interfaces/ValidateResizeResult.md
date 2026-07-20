---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:309](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L309)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:310](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L310)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:311](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L311)

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

Defined in: [calendar/calendar.ts:316](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L316)

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

Defined in: [calendar/calendar.ts:321](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L321)
