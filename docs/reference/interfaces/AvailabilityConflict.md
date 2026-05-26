---
id: AvailabilityConflict
title: AvailabilityConflict
---

# Interface: AvailabilityConflict

Defined in: [calendar/types.ts:181](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L181)

Information about a specific availability conflict

## Properties

### conflictRange

```ts
conflictRange: object;
```

Defined in: [calendar/types.ts:185](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L185)

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

Defined in: [calendar/types.ts:183](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L183)

The date where the conflict occurred (YYYY-MM-DD)

***

### description

```ts
description: string;
```

Defined in: [calendar/types.ts:194](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L194)

Human-readable description of the conflict

***

### resourceDetails

```ts
resourceDetails: UnavailabilityReason[];
```

Defined in: [calendar/types.ts:192](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L192)

Detailed reasons for each resource

***

### resourceIds

```ts
resourceIds: string[];
```

Defined in: [calendar/types.ts:190](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L190)

The resource(s) whose availability is being violated
