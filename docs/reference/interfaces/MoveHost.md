---
id: MoveHost
title: MoveHost
---

# Interface: MoveHost\<TResource, TEvent\>

Defined in: [calendar/moveController.ts:17](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L17)

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

Defined in: [calendar/features/types.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L53)

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

Defined in: [calendar/features/types.ts:47](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L47)

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

Defined in: [calendar/moveController.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L23)

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

Defined in: [calendar/features/types.ts:46](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L46)

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

Defined in: [calendar/features/types.ts:41](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L41)

#### Parameters

##### isoDate

`string`

#### Returns

`void`

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`goToSpecificPeriod`](CalendarHost.md#gotospecificperiod)

***

### invalidateEvents()

```ts
invalidateEvents: () => void;
```

Defined in: [calendar/features/types.ts:40](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L40)

#### Returns

`void`

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`invalidateEvents`](CalendarHost.md#invalidateevents)

***

### removeEvent()

```ts
removeEvent: (id) => void;
```

Defined in: [calendar/features/types.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L52)

#### Parameters

##### id

`string`

#### Returns

`void`

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`removeEvent`](CalendarHost.md#removeevent)

***

### resolveMasterEventId()

```ts
resolveMasterEventId: (eventId) => string;
```

Defined in: [calendar/moveController.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L22)

#### Parameters

##### eventId

`string`

#### Returns

`string`

***

### validateEventDependencies()

```ts
validateEventDependencies: (event, dependsOn) => object;
```

Defined in: [calendar/features/types.ts:61](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L61)

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
optional error: EventMutationError;
```

##### valid

```ts
valid: boolean;
```

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`validateEventDependencies`](CalendarHost.md#validateeventdependencies)

***

### validateEventMove()

```ts
validateEventMove: (options) => ValidateMoveResult;
```

Defined in: [calendar/moveController.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L21)

#### Parameters

##### options

[`ValidateMoveOptions`](ValidateMoveOptions.md)

#### Returns

[`ValidateMoveResult`](ValidateMoveResult.md)

***

### validateEventPlacement()

```ts
validateEventPlacement: (event) => object;
```

Defined in: [calendar/features/types.ts:65](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L65)

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

Defined in: [calendar/features/types.ts:54](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L54)

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

### write()

```ts
write: (ops, reason) => InvertibleOp<TEvent>[];
```

Defined in: [calendar/features/types.ts:42](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L42)

#### Parameters

##### ops

(`IntentOp` \| `InvertibleOp`\<`TEvent`\>)[]

##### reason

`string`

#### Returns

`InvertibleOp`\<`TEvent`\>[]

#### Inherited from

[`CalendarHost`](CalendarHost.md).[`write`](CalendarHost.md#write)
