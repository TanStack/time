---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:303](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L303)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:304](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L304)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:305](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L305)

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

Defined in: [calendar/calendar.ts:310](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L310)

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

Defined in: [calendar/calendar.ts:315](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L315)
