---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/types.ts:251](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L251)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:252](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L252)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:253](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L253)

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

Defined in: [calendar/types.ts:258](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L258)

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

Defined in: [calendar/types.ts:263](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L263)
