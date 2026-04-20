---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:200](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L200)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:201](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L201)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:202](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L202)

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

Defined in: [calendar/calendar.ts:207](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L207)

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

Defined in: [calendar/calendar.ts:212](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L212)
