---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/types.ts:281](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L281)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:282](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L282)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:283](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L283)

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

Defined in: [calendar/types.ts:288](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L288)

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

Defined in: [calendar/types.ts:293](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L293)
