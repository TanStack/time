---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:342](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L342)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:343](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L343)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:344](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L344)

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

Defined in: [calendar/calendar.ts:349](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L349)

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

Defined in: [calendar/calendar.ts:354](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L354)
