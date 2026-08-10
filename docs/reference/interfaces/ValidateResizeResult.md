---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/types.ts:271](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L271)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:272](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L272)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:273](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L273)

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

Defined in: [calendar/types.ts:278](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L278)

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

Defined in: [calendar/types.ts:283](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L283)
