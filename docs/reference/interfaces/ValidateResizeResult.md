---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:283](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L283)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:284](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L284)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:285](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L285)

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

Defined in: [calendar/calendar.ts:290](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L290)

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

Defined in: [calendar/calendar.ts:295](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L295)
