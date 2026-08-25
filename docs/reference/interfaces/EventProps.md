---
id: EventProps
title: EventProps
---

# Interface: EventProps\<TResource, TEvent\>

Defined in: [calendar/types.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L134)

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

Defined in: [calendar/types.ts:141](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L141)

***

### isSplitEvent

```ts
isSplitEvent: boolean;
```

Defined in: [calendar/types.ts:138](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L138)

***

### layout?

```ts
optional layout: EventLayout;
```

Defined in: [calendar/types.ts:143](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L143)

***

### overlappingEvents

```ts
overlappingEvents: TEvent[];
```

Defined in: [calendar/types.ts:139](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L139)

***

### start

```ts
start: string;
```

Defined in: [calendar/types.ts:140](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L140)

***

### style?

```ts
optional style: LayoutStyle;
```

Defined in: [calendar/types.ts:144](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L144)
