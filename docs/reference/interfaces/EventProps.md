---
id: EventProps
title: EventProps
---

# Interface: EventProps\<TResource, TEvent\>

Defined in: [calendar/types.ts:105](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L105)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\> = [`Event`](Event.md)\<`TResource`\>

## Properties

### end

```ts
end: string;
```

Defined in: [calendar/types.ts:112](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L112)

***

### isSplitEvent

```ts
isSplitEvent: boolean;
```

Defined in: [calendar/types.ts:109](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L109)

***

### layout?

```ts
optional layout: EventLayout;
```

Defined in: [calendar/types.ts:114](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L114)

***

### overlappingEvents

```ts
overlappingEvents: TEvent[];
```

Defined in: [calendar/types.ts:110](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L110)

***

### start

```ts
start: string;
```

Defined in: [calendar/types.ts:111](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L111)

***

### style?

```ts
optional style: LayoutStyle;
```

Defined in: [calendar/types.ts:115](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L115)
