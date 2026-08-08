---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/types.ts:255](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L255)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:256](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L256)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:257](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L257)

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

Defined in: [calendar/types.ts:262](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L262)

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

Defined in: [calendar/types.ts:267](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L267)
