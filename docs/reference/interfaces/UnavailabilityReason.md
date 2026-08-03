---
id: UnavailabilityReason
title: UnavailabilityReason
---

# Interface: UnavailabilityReason

Defined in: [calendar/types.ts:177](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L177)

Information about why a resource is unavailable

## Properties

### capacityInfo?

```ts
optional capacityInfo: object;
```

Defined in: [calendar/types.ts:187](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L187)

Current capacity usage if applicable

#### max

```ts
max: number;
```

#### remaining

```ts
remaining: number;
```

#### used

```ts
used: number;
```

***

### description

```ts
description: string;
```

Defined in: [calendar/types.ts:185](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L185)

Human-readable explanation

***

### reason

```ts
reason: "outside-hours" | "capacity" | "no-availability";
```

Defined in: [calendar/types.ts:183](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L183)

Why the resource is unavailable

***

### resourceId

```ts
resourceId: string;
```

Defined in: [calendar/types.ts:179](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L179)

Resource ID

***

### resourceLabel

```ts
resourceLabel: string;
```

Defined in: [calendar/types.ts:181](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L181)

Resource label/name
