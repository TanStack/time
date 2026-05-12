---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:240](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L240)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:241](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L241)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:242](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L242)

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

Defined in: [calendar/calendar.ts:247](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L247)

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

Defined in: [calendar/calendar.ts:252](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L252)
