---
id: UnavailabilityReason
title: UnavailabilityReason
---

# Interface: UnavailabilityReason

Defined in: [calendar/types.ts:89](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L89)

Information about why a resource is unavailable

## Properties

### capacityInfo?

```ts
optional capacityInfo: object;
```

Defined in: [calendar/types.ts:99](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L99)

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

Defined in: [calendar/types.ts:97](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L97)

Human-readable explanation

***

### reason

```ts
reason: "outside-hours" | "capacity" | "no-availability";
```

Defined in: [calendar/types.ts:95](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L95)

Why the resource is unavailable

***

### resourceId

```ts
resourceId: string;
```

Defined in: [calendar/types.ts:91](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L91)

Resource ID

***

### resourceLabel

```ts
resourceLabel: string;
```

Defined in: [calendar/types.ts:93](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L93)

Resource label/name
