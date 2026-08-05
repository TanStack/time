---
id: EventProps
title: EventProps
---

# Interface: EventProps\<TResource, TEvent\>

Defined in: [calendar/types.ts:111](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L111)

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

Defined in: [calendar/types.ts:118](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L118)

***

### isSplitEvent

```ts
isSplitEvent: boolean;
```

Defined in: [calendar/types.ts:115](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L115)

***

### layout?

```ts
optional layout: EventLayout;
```

Defined in: [calendar/types.ts:120](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L120)

***

### overlappingEvents

```ts
overlappingEvents: TEvent[];
```

Defined in: [calendar/types.ts:116](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L116)

***

### start

```ts
start: string;
```

Defined in: [calendar/types.ts:117](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L117)

***

### style?

```ts
optional style: LayoutStyle;
```

Defined in: [calendar/types.ts:121](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L121)
