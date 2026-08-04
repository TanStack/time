---
id: CalendarStore
title: CalendarStore
---

# Interface: CalendarStore

Defined in: [calendar/types.ts:163](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L163)

## Properties

### activeDate

```ts
activeDate: string;
```

Defined in: [calendar/types.ts:167](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L167)

ISO date (YYYY-MM-DD) currently focused.

***

### currentPeriod

```ts
currentPeriod: string;
```

Defined in: [calendar/types.ts:165](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L165)

ISO date (YYYY-MM-DD) the view is anchored to.

***

### eventsVersion

```ts
eventsVersion: number;
```

Defined in: [calendar/types.ts:169](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L169)

***

### isPending

```ts
isPending: boolean;
```

Defined in: [calendar/types.ts:171](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L171)

True while an async fetchEvents call is in-flight for the current viewport.

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/types.ts:168](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L168)
