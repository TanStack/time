---
id: AvailabilityConflict
title: AvailabilityConflict
---

# Interface: AvailabilityConflict

Defined in: [calendar/types.ts:109](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L109)

Information about a specific availability conflict

## Properties

### conflictRange

```ts
conflictRange: object;
```

Defined in: [calendar/types.ts:113](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L113)

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

Defined in: [calendar/types.ts:111](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L111)

The date where the conflict occurred (YYYY-MM-DD)

***

### description

```ts
description: string;
```

Defined in: [calendar/types.ts:122](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L122)

Human-readable description of the conflict

***

### resourceDetails

```ts
resourceDetails: UnavailabilityReason[];
```

Defined in: [calendar/types.ts:120](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L120)

Detailed reasons for each resource

***

### resourceIds

```ts
resourceIds: string[];
```

Defined in: [calendar/types.ts:118](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L118)

The resource(s) whose availability is being violated
