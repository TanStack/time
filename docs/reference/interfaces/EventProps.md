---
id: EventProps
title: EventProps
---

# Interface: EventProps\<TResource, TEvent\>

Defined in: [calendar/types.ts:129](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L129)

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

Defined in: [calendar/types.ts:136](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L136)

***

### isSplitEvent

```ts
isSplitEvent: boolean;
```

Defined in: [calendar/types.ts:133](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L133)

***

### layout?

```ts
optional layout: EventLayout;
```

Defined in: [calendar/types.ts:138](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L138)

***

### overlappingEvents

```ts
overlappingEvents: TEvent[];
```

Defined in: [calendar/types.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L134)

***

### start

```ts
start: string;
```

Defined in: [calendar/types.ts:135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L135)

***

### style?

```ts
optional style: LayoutStyle;
```

Defined in: [calendar/types.ts:139](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L139)
