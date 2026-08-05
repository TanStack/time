---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:370](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L370)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:371](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L371)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:372](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L372)

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

Defined in: [calendar/calendar.ts:377](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L377)

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

Defined in: [calendar/calendar.ts:382](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L382)
