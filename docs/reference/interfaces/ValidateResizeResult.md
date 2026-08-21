---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/types.ts:286](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L286)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:287](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L287)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:288](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L288)

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

Defined in: [calendar/types.ts:293](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L293)

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

Defined in: [calendar/types.ts:298](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L298)
