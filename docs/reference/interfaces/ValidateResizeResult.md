---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:315](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L315)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:316](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L316)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:317](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L317)

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

Defined in: [calendar/calendar.ts:322](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L322)

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

Defined in: [calendar/calendar.ts:327](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L327)
