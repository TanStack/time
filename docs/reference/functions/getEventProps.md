---
id: getEventProps
title: getEventProps
---

# Function: getEventProps()

```ts
function getEventProps(
   eventMap, 
   event, 
   state, 
   options): 
  | {
  end: string;
  isSplitEvent: boolean;
  overlappingEvents: Event<Resource>[];
  start: string;
}
  | {
  end: string;
  isSplitEvent: boolean;
  layout: EventLayout;
  overlappingEvents: Event<Resource>[];
  start: string;
  style: LayoutStyle;
};
```

Defined in: [calendar/getEventProps.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getEventProps.ts#L60)

## Parameters

### eventMap

`Map`\<`string`, [`Event`](../interfaces/Event.md)\<[`Resource`](../interfaces/Resource.md)\>[]\>

### event

[`Event`](../interfaces/Event.md)

### state

[`CalendarStore`](../interfaces/CalendarStore.md)

### options

`GetEventPropsOptions`

## Returns

  \| \{
  `end`: `string`;
  `isSplitEvent`: `boolean`;
  `overlappingEvents`: [`Event`](../interfaces/Event.md)\<[`Resource`](../interfaces/Resource.md)\>[];
  `start`: `string`;
\}
  \| \{
  `end`: `string`;
  `isSplitEvent`: `boolean`;
  `layout`: [`EventLayout`](../type-aliases/EventLayout.md);
  `overlappingEvents`: [`Event`](../interfaces/Event.md)\<[`Resource`](../interfaces/Resource.md)\>[];
  `start`: `string`;
  `style`: [`LayoutStyle`](../interfaces/LayoutStyle.md);
\}
