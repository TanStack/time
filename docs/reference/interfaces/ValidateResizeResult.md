---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/types.ts:249](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L249)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:250](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L250)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:251](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L251)

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

Defined in: [calendar/types.ts:256](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L256)

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

Defined in: [calendar/types.ts:261](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L261)
