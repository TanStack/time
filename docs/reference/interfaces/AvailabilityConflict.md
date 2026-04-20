---
id: AvailabilityConflict
title: AvailabilityConflict
---

# Interface: AvailabilityConflict

Defined in: [calendar/types.ts:160](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L160)

Information about a specific availability conflict

## Properties

### conflictRange

```ts
conflictRange: object;
```

Defined in: [calendar/types.ts:164](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L164)

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

Defined in: [calendar/types.ts:162](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L162)

The date where the conflict occurred (YYYY-MM-DD)

***

### description

```ts
description: string;
```

Defined in: [calendar/types.ts:173](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L173)

Human-readable description of the conflict

***

### resourceDetails

```ts
resourceDetails: UnavailabilityReason[];
```

Defined in: [calendar/types.ts:171](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L171)

Detailed reasons for each resource

***

### resourceIds

```ts
resourceIds: string[];
```

Defined in: [calendar/types.ts:169](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L169)

The resource(s) whose availability is being violated
