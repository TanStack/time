---
id: UnavailabilityReason
title: UnavailabilityReason
---

# Interface: UnavailabilityReason

Defined in: [calendar/types.ts:186](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L186)

Information about why a resource is unavailable

## Properties

### capacityInfo?

```ts
optional capacityInfo: object;
```

Defined in: [calendar/types.ts:196](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L196)

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

Defined in: [calendar/types.ts:194](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L194)

Human-readable explanation

***

### reason

```ts
reason: "outside-hours" | "capacity" | "no-availability";
```

Defined in: [calendar/types.ts:192](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L192)

Why the resource is unavailable

***

### resourceId

```ts
resourceId: string;
```

Defined in: [calendar/types.ts:188](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L188)

Resource ID

***

### resourceLabel

```ts
resourceLabel: string;
```

Defined in: [calendar/types.ts:190](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L190)

Resource label/name
