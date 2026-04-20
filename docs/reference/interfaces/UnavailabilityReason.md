---
id: UnavailabilityReason
title: UnavailabilityReason
---

# Interface: UnavailabilityReason

Defined in: [calendar/types.ts:140](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L140)

Information about why a resource is unavailable

## Properties

### capacityInfo?

```ts
optional capacityInfo: object;
```

Defined in: [calendar/types.ts:150](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L150)

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

Defined in: [calendar/types.ts:148](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L148)

Human-readable explanation

***

### reason

```ts
reason: "outside-hours" | "capacity" | "no-availability";
```

Defined in: [calendar/types.ts:146](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L146)

Why the resource is unavailable

***

### resourceId

```ts
resourceId: string;
```

Defined in: [calendar/types.ts:142](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L142)

Resource ID

***

### resourceLabel

```ts
resourceLabel: string;
```

Defined in: [calendar/types.ts:144](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L144)

Resource label/name
