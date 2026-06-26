---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:301](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L301)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:302](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L302)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:303](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L303)

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

Defined in: [calendar/calendar.ts:308](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L308)

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

Defined in: [calendar/calendar.ts:313](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L313)
