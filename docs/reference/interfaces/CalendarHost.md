---
id: CalendarHost
title: CalendarHost
---

# Interface: CalendarHost\<TResource, TEvent\>

Defined in: [calendar/features/types.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L24)

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

Defined in: [calendar/features/types.ts:63](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L63)

#### Parameters

##### id

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

#### Returns

`void`

***

### editEvent()

```ts
editEvent: (eventId, updates, options?) => Promise<SaveEventResult>;
```

Defined in: [calendar/features/types.ts:48](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L48)

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

***

### editRecurringEvent()

```ts
editRecurringEvent: (eventId, updates, options) => Promise<SaveEventResult>;
```

Defined in: [calendar/features/types.ts:54](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L54)

#### Parameters

##### eventId

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

##### options

###### dependsOn?

[`EventDependency`](EventDependency.md)[]

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

Defined in: [calendar/features/types.ts:47](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L47)

#### Parameters

##### start

`string`

##### end

`string`

#### Returns

`Promise`\<`void`\>

***

### getDaysWithEvents()

```ts
getDaysWithEvents: () => Day<TResource, TEvent>[];
```

Defined in: [calendar/features/types.ts:40](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L40)

#### Returns

[`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\>[]

***

### getEvent()

```ts
getEvent: (id) => TEvent | undefined;
```

Defined in: [calendar/features/types.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L28)

#### Parameters

##### id

`string`

#### Returns

`TEvent` \| `undefined`

***

### getEventMap()

```ts
getEventMap: (window?) => Map<string, TEvent[]>;
```

Defined in: [calendar/features/types.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L36)

#### Parameters

##### window?

###### end

`string`

###### start

`string`

#### Returns

`Map`\<`string`, `TEvent`[]\>

***

### getEvents()

```ts
getEvents: () => TEvent[];
```

Defined in: [calendar/features/types.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L29)

#### Returns

`TEvent`[]

***

### getEventsByDate()

```ts
getEventsByDate: (date) => TEvent[];
```

Defined in: [calendar/features/types.ts:41](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L41)

#### Parameters

##### date

`string`

#### Returns

`TEvent`[]

***

### getOptions()

```ts
getOptions: () => object;
```

Defined in: [calendar/features/types.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L31)

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

***

### getState()

```ts
getState: () => CalendarStore;
```

Defined in: [calendar/features/types.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L30)

#### Returns

[`CalendarStore`](CalendarStore.md)

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod: (isoDate) => void;
```

Defined in: [calendar/features/types.ts:42](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L42)

#### Parameters

##### isoDate

`string`

#### Returns

`void`

***

### removeEvent()

```ts
removeEvent: (id) => void;
```

Defined in: [calendar/features/types.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L53)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### validateEventDependencies()

```ts
validateEventDependencies: (event, dependsOn) => object;
```

Defined in: [calendar/features/types.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L71)

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

***

### validateEventPlacement()

```ts
validateEventPlacement: (event) => object;
```

Defined in: [calendar/features/types.ts:76](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L76)

#### Parameters

##### event

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

***

### validateMove()

```ts
validateMove: (eventId, newStart, newEnd, newResources?, newConsumption?) => object;
```

Defined in: [calendar/features/types.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L64)

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

***

### validateResize()

```ts
validateResize: (options) => ValidateResizeResult;
```

Defined in: [calendar/features/types.ts:75](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L75)

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

Defined in: [calendar/features/types.ts:43](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L43)

#### Parameters

##### ops

(`IntentOp` \| `InvertibleOp`\<`TEvent`\>)[]

##### reason

`string`

#### Returns

`InvertibleOp`\<`TEvent`\>[]
