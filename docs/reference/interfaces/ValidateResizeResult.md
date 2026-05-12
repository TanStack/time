---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:248](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L248)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:249](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L249)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:250](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L250)

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

Defined in: [calendar/calendar.ts:255](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L255)

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

Defined in: [calendar/calendar.ts:260](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L260)
