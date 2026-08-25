---
id: ValidateMoveResult
title: ValidateMoveResult
---

# Interface: ValidateMoveResult

Defined in: [calendar/types.ts:308](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L308)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:309](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L309)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:310](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L310)

#### conflicts

```ts
conflicts: AvailabilityConflict[];
```

#### eventTitle?

```ts
optional eventTitle: string;
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

Defined in: [calendar/types.ts:316](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L316)

#### durationMinutes

```ts
durationMinutes: number;
```

#### end

```ts
end: string;
```

#### moved

```ts
moved: boolean;
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

Defined in: [calendar/types.ts:322](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L322)
