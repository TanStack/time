---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:279](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L279)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:280](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L280)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:281](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L281)

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

Defined in: [calendar/calendar.ts:286](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L286)

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

Defined in: [calendar/calendar.ts:291](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L291)
