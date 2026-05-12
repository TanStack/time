---
id: AvailabilityConflict
title: AvailabilityConflict
---

# Interface: AvailabilityConflict

Defined in: [calendar/types.ts:170](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L170)

Information about a specific availability conflict

## Properties

### conflictRange

```ts
conflictRange: object;
```

Defined in: [calendar/types.ts:174](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L174)

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

Defined in: [calendar/types.ts:172](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L172)

The date where the conflict occurred (YYYY-MM-DD)

***

### description

```ts
description: string;
```

Defined in: [calendar/types.ts:183](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L183)

Human-readable description of the conflict

***

### resourceDetails

```ts
resourceDetails: UnavailabilityReason[];
```

Defined in: [calendar/types.ts:181](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L181)

Detailed reasons for each resource

***

### resourceIds

```ts
resourceIds: string[];
```

Defined in: [calendar/types.ts:179](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L179)

The resource(s) whose availability is being violated
