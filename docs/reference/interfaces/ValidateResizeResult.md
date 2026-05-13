---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:266](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L266)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:267](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L267)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:268](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L268)

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

Defined in: [calendar/calendar.ts:273](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L273)

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

Defined in: [calendar/calendar.ts:278](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L278)
