---
id: ResizeHost
title: ResizeHost
---

# Interface: ResizeHost\<TResource, TEvent\>

Defined in: [calendar/resizeController.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L19)

## Extends

- [`CalendarHost`](CalendarHost.md)\<`TResource`, `TEvent`\>

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### commitUpdate()

```ts
commitUpdate: (id, updates) => void;
```

Defined in: [calendar/features/types.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L52)

#### Parameters

##### id

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

#### Returns

`void`

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`commitUpdate`](CalendarHost.md#commitupdate)

***

### editEvent()

```ts
editEvent: (eventId, updates, options?) => Promise<SaveEventResult>;
```

Defined in: [calendar/features/types.ts:46](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L46)

#### Parameters

##### eventId

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

##### options?

###### dependsOn?

[`EventDependency`](EventDependency.md)[]

#### Returns

`Promise`\<[`SaveEventResult`](../type-aliases/SaveEventResult.md)\>

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`editEvent`](CalendarHost.md#editevent)

***

### editRecurringEvent()

```ts
editRecurringEvent: (eventId, updates, options) => Promise<SaveEventResult>;
```

Defined in: [calendar/resizeController.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L24)

#### Parameters

##### eventId

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

##### options

###### occurrenceStart?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

###### scope

[`RecurrenceEditScope`](../type-aliases/RecurrenceEditScope.md)

#### Returns

`Promise`\<[`SaveEventResult`](../type-aliases/SaveEventResult.md)\>

***

### fetchEventsForRange()

```ts
fetchEventsForRange: (start, end) => Promise<void>;
```

Defined in: [calendar/features/types.ts:45](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L45)

#### Parameters

##### start

`string`

##### end

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`fetchEventsForRange`](CalendarHost.md#fetcheventsforrange)

***

### getDaysWithEvents()

```ts
getDaysWithEvents: () => Day<TResource, TEvent>[];
```

Defined in: [calendar/features/types.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L38)

#### Returns

[`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\>[]

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`getDaysWithEvents`](CalendarHost.md#getdayswithevents)

***

### getEvent()

```ts
getEvent: (id) => TEvent | undefined;
```

Defined in: [calendar/features/types.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L25)

#### Parameters

##### id

`string`

#### Returns

`TEvent` \| `undefined`

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`getEvent`](CalendarHost.md#getevent)

***

### getEventMap()

```ts
getEventMap: (window?) => Map<string, TEvent[]>;
```

Defined in: [calendar/features/types.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L34)

#### Parameters

##### window?

###### end

`string`

###### start

`string`

#### Returns

`Map`\<`string`, `TEvent`[]\>

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`getEventMap`](CalendarHost.md#geteventmap)

***

### getEvents()

```ts
getEvents: () => TEvent[];
```

Defined in: [calendar/features/types.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L26)

#### Returns

`TEvent`[]

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`getEvents`](CalendarHost.md#getevents)

***

### getEventsByDate()

```ts
getEventsByDate: (date) => TEvent[];
```

Defined in: [calendar/features/types.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L39)

#### Parameters

##### date

`string`

#### Returns

`TEvent`[]

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`getEventsByDate`](CalendarHost.md#geteventsbydate)

***

### getOptions()

```ts
getOptions: () => object;
```

Defined in: [calendar/features/types.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L28)

#### Returns

`object`

##### layout?

```ts
optional layout: LayoutOptions;
```

##### resources

```ts
resources: TResource[] | null;
```

##### timeZone

```ts
timeZone: TimeZoneLike;
```

##### workingTime

```ts
workingTime: WorkingTimeConfig;
```

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`getOptions`](CalendarHost.md#getoptions)

***

### getState()

```ts
getState: () => CalendarStore;
```

Defined in: [calendar/features/types.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L27)

#### Returns

[`CalendarStore`](CalendarStore.md)

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`getState`](CalendarHost.md#getstate)

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod: (isoDate) => void;
```

Defined in: [calendar/features/types.ts:40](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L40)

#### Parameters

##### isoDate

`string`

#### Returns

`void`

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`goToSpecificPeriod`](CalendarHost.md#gotospecificperiod)

***

### removeEvent()

```ts
removeEvent: (id) => void;
```

Defined in: [calendar/features/types.ts:51](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L51)

#### Parameters

##### id

`string`

#### Returns

`void`

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`removeEvent`](CalendarHost.md#removeevent)

***

### validateEventDependencies()

```ts
validateEventDependencies: (event, dependsOn) => object;
```

Defined in: [calendar/features/types.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L60)

#### Parameters

##### event

###### end

`string`

###### id?

`string`

###### start

`string`

###### title

`string`

##### dependsOn

[`EventDependency`](EventDependency.md)[]

#### Returns

`object`

##### error?

```ts
optional error: ResizeError;
```

##### valid

```ts
valid: boolean;
```

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`validateEventDependencies`](CalendarHost.md#validateeventdependencies)

***

### validateEventPlacement()

```ts
validateEventPlacement: (event) => object;
```

Defined in: [calendar/features/types.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L64)

#### Parameters

##### event

###### calendarId?

`string`

###### consumption?

`number`[]

###### end

`string`

###### id?

`string`

###### resources?

(`string` \| `TResource`)[]

###### start

`string`

###### title

`string`

#### Returns

`object`

##### blocked

```ts
blocked: boolean;
```

##### message?

```ts
optional message: string;
```

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`validateEventPlacement`](CalendarHost.md#validateeventplacement)

***

### validateMove()

```ts
validateMove: (eventId, newStart, newEnd, newResources?, newConsumption?) => object;
```

Defined in: [calendar/features/types.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L53)

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

##### newResources?

(`string` \| `TResource`)[]

##### newConsumption?

`number`[]

#### Returns

`object`

##### blocked

```ts
blocked: boolean;
```

##### blockedEventTitle?

```ts
optional blockedEventTitle: string;
```

##### message?

```ts
optional message: string;
```

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`validateMove`](CalendarHost.md#validatemove)

***

### validateResize()

```ts
validateResize: (options) => ValidateResizeResult;
```

Defined in: [calendar/resizeController.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L23)

#### Parameters

##### options

[`ValidateResizeOptions`](ValidateResizeOptions.md)

#### Returns

[`ValidateResizeResult`](ValidateResizeResult.md)

***

### write()

```ts
write: (ops, reason) => InvertibleOp<TEvent>[];
```

Defined in: [calendar/features/types.ts:41](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L41)

#### Parameters

##### ops

(`IntentOp` \| `InvertibleOp`\<`TEvent`\>)[]

##### reason

`string`

#### Returns

`InvertibleOp`\<`TEvent`\>[]

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`write`](CalendarHost.md#write)
