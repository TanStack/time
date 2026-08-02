---
id: AvailabilityConflict
title: AvailabilityConflict
---

# Interface: AvailabilityConflict

Defined in: [calendar/types.ts:197](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L197)

Information about a specific availability conflict

## Properties

### conflictRange

```ts
conflictRange: object;
```

Defined in: [calendar/types.ts:201](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L201)

Time range that conflicts with availability

#### end

```ts
end: string;
```

#### start

```ts
start: string;
```

***

### date

```ts
date: string;
```

Defined in: [calendar/types.ts:199](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L199)

The date where the conflict occurred (YYYY-MM-DD)

***

### description

```ts
description: string;
```

Defined in: [calendar/types.ts:210](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L210)

Human-readable description of the conflict

***

### resourceDetails

```ts
resourceDetails: UnavailabilityReason[];
```

Defined in: [calendar/types.ts:208](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L208)

Detailed reasons for each resource

***

### resourceIds

```ts
resourceIds: string[];
```

Defined in: [calendar/types.ts:206](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L206)

The resource(s) whose availability is being violated
