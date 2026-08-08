---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/types.ts:253](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L253)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:254](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L254)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:255](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L255)

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

Defined in: [calendar/types.ts:260](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L260)

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

Defined in: [calendar/types.ts:265](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L265)
