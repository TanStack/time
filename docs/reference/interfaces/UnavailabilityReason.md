---
id: UnavailabilityReason
title: UnavailabilityReason
---

# Interface: UnavailabilityReason

Defined in: [calendar/types.ts:150](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L150)

Information about why a resource is unavailable

## Properties

### capacityInfo?

```ts
optional capacityInfo: object;
```

Defined in: [calendar/types.ts:160](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L160)

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

Defined in: [calendar/types.ts:158](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L158)

Human-readable explanation

***

### reason

```ts
reason: "outside-hours" | "capacity" | "no-availability";
```

Defined in: [calendar/types.ts:156](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L156)

Why the resource is unavailable

***

### resourceId

```ts
resourceId: string;
```

Defined in: [calendar/types.ts:152](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L152)

Resource ID

***

### resourceLabel

```ts
resourceLabel: string;
```

Defined in: [calendar/types.ts:154](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L154)

Resource label/name
