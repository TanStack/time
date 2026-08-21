---
id: ValidateMoveResult
title: ValidateMoveResult
---

# Interface: ValidateMoveResult

Defined in: [calendar/types.ts:313](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L313)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:314](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L314)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:315](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L315)

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

Defined in: [calendar/types.ts:321](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L321)

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

Defined in: [calendar/types.ts:327](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L327)
