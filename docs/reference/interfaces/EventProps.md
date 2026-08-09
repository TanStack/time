---
id: EventProps
title: EventProps
---

# Interface: EventProps\<TResource, TEvent\>

Defined in: [calendar/types.ts:125](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L125)

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

Defined in: [calendar/types.ts:132](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L132)

***

### isSplitEvent

```ts
isSplitEvent: boolean;
```

Defined in: [calendar/types.ts:129](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L129)

***

### layout?

```ts
optional layout: EventLayout;
```

Defined in: [calendar/types.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L134)

***

### overlappingEvents

```ts
overlappingEvents: TEvent[];
```

Defined in: [calendar/types.ts:130](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L130)

***

### start

```ts
start: string;
```

Defined in: [calendar/types.ts:131](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L131)

***

### style?

```ts
optional style: LayoutStyle;
```

Defined in: [calendar/types.ts:135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L135)
