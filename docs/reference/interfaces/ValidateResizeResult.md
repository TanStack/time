---
id: ValidateResizeResult
title: ValidateResizeResult
---

# Interface: ValidateResizeResult

Defined in: [calendar/calendar.ts:291](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L291)

## Properties

### blocked

```ts
blocked: boolean;
```

Defined in: [calendar/calendar.ts:292](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L292)

***

### error?

```ts
optional error: object;
```

Defined in: [calendar/calendar.ts:293](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L293)

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

Defined in: [calendar/calendar.ts:298](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L298)

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

Defined in: [calendar/calendar.ts:303](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L303)
