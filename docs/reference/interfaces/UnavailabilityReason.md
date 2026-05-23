---
id: UnavailabilityReason
title: UnavailabilityReason
---

# Interface: UnavailabilityReason

Defined in: [calendar/types.ts:161](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L161)

Information about why a resource is unavailable

## Properties

### capacityInfo?

```ts
optional capacityInfo: object;
```

Defined in: [calendar/types.ts:171](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L171)

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

Defined in: [calendar/types.ts:169](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L169)

Human-readable explanation

***

### reason

```ts
reason: "outside-hours" | "capacity" | "no-availability";
```

Defined in: [calendar/types.ts:167](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L167)

Why the resource is unavailable

***

### resourceId

```ts
resourceId: string;
```

Defined in: [calendar/types.ts:163](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L163)

Resource ID

***

### resourceLabel

```ts
resourceLabel: string;
```

Defined in: [calendar/types.ts:165](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L165)

Resource label/name
