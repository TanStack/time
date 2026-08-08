---
id: GetEventProps
title: GetEventProps
---

# Type Alias: GetEventProps()\<TResource, TEvent\>

```ts
type GetEventProps<TResource, TEvent> = (event, layoutOptions?) => EventProps<TResource, TEvent>;
```

Defined in: [calendar/types.ts:120](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L120)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Parameters

### event

`TEvent`

### layoutOptions?

[`LayoutOptions`](../interfaces/LayoutOptions.md)

## Returns

[`EventProps`](../interfaces/EventProps.md)\<`TResource`, `TEvent`\>
