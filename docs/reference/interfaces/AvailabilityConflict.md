---
id: AvailabilityConflict
title: AvailabilityConflict
---

# Interface: AvailabilityConflict

Defined in: [calendar/types.ts:210](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L210)

Information about a specific availability conflict

## Properties

### conflictRange

```ts
conflictRange: object;
```

Defined in: [calendar/types.ts:214](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L214)

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

Defined in: [calendar/types.ts:212](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L212)

The date where the conflict occurred (YYYY-MM-DD)

***

### description

```ts
description: string;
```

Defined in: [calendar/types.ts:223](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L223)

Human-readable description of the conflict

***

### resourceDetails

```ts
resourceDetails: UnavailabilityReason[];
```

Defined in: [calendar/types.ts:221](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L221)

Detailed reasons for each resource

***

### resourceIds

```ts
resourceIds: string[];
```

Defined in: [calendar/types.ts:219](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L219)

The resource(s) whose availability is being violated
