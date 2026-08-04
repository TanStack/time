---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:368](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L368)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:369](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L369)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:370](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L370)

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

Defined in: [calendar/calendar.ts:375](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L375)

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

Defined in: [calendar/calendar.ts:380](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L380)
