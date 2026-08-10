---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/types.ts:275](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L275)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:276](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L276)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:277](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L277)

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

Defined in: [calendar/types.ts:282](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L282)

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

Defined in: [calendar/types.ts:287](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L287)
