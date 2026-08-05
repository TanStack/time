---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/types.ts:257](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L257)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/types.ts:258](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L258)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/types.ts:259](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L259)

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

Defined in: [calendar/types.ts:264](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L264)

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

Defined in: [calendar/types.ts:269](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L269)
