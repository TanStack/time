---
id: CalendarApi
title: CalendarApi
---

# Interface: CalendarApi\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:181](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L181)

## Extends

- `CalendarActions`\<`TResource`, `TEvent`\>.`ConvertTemporalToString`\<`CalendarState`\<`TResource`, `TEvent`\>\>

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### activeDate

```ts
activeDate: string;
```

Defined in: [calendar/calendar.ts:174](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L174)

The currently active date in the calendar.

#### Inherited from

```ts
ConvertTemporalToString.activeDate
```

***

### addEvent()

```ts
addEvent: (event) => void;
```

Defined in: [calendar/calendar.ts:115](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L115)

Adds a new event to the calendar.

#### Parameters

##### event

`TEvent`

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.addEvent
```

***

### canGoNextPeriod()

```ts
canGoNextPeriod: () => boolean;
```

Defined in: [calendar/calendar.ts:84](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L84)

Checks if navigation to the next period is allowed within the range.

#### Returns

`boolean`

#### Inherited from

```ts
CalendarActions.canGoNextPeriod
```

***

### canGoPreviousPeriod()

```ts
canGoPreviousPeriod: () => boolean;
```

Defined in: [calendar/calendar.ts:82](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L82)

Checks if navigation to the previous period is allowed within the range.

#### Returns

`boolean`

#### Inherited from

```ts
CalendarActions.canGoPreviousPeriod
```

***

### changeViewMode()

```ts
changeViewMode: (newViewMode) => void;
```

Defined in: [calendar/calendar.ts:86](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L86)

Changes the current view mode of the calendar.

#### Parameters

##### newViewMode

[`ViewMode`](ViewMode.md)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.changeViewMode
```

***

### createDependency()

```ts
createDependency: (sourceId, targetId) => object;
```

Defined in: [calendar/calendar.ts:157](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L157)

Creates a dependency link from source to target event.
If the target event starts before the source event ends, it will optionally reschedule the target.

#### Parameters

##### sourceId

`string`

##### targetId

`string`

#### Returns

`object`

##### blocked

```ts
blocked: boolean;
```

##### error?

```ts
optional error: ResizeError;
```

#### Inherited from

```ts
CalendarActions.createDependency
```

***

### currentPeriod

```ts
currentPeriod: string;
```

Defined in: [calendar/calendar.ts:168](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L168)

The currently focused date period in the calendar.

#### Inherited from

```ts
ConvertTemporalToString.currentPeriod
```

***

### days

```ts
days: Day<TResource, TEvent>[];
```

Defined in: [calendar/calendar.ts:172](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L172)

An array of days, each potentially containing events.

#### Inherited from

```ts
ConvertTemporalToString.days
```

***

### formatPeriodLabel()

```ts
formatPeriodLabel: (options?) => string;
```

Defined in: [calendar/calendar.ts:133](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L133)

Returns a human-readable label for the currently visible date range.

#### Parameters

##### options?

###### locale?

`string`

#### Returns

`string`

#### Inherited from

```ts
CalendarActions.formatPeriodLabel
```

***

### getDaysNames()

```ts
getDaysNames: (weekday?) => string[];
```

Defined in: [calendar/calendar.ts:101](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L101)

Retrieves the names of the days of the week, based on the current locale.

#### Parameters

##### weekday?

`"long"` | `"short"`

#### Returns

`string`[]

#### Inherited from

```ts
CalendarActions.getDaysNames
```

***

### getEventProps()

```ts
getEventProps: (event) => object;
```

Defined in: [calendar/calendar.ts:88](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L88)

Retrieves styling properties for a specific event.

#### Parameters

##### event

`TEvent`

#### Returns

`object`

##### end

```ts
end: string;
```

##### isSplitEvent

```ts
isSplitEvent: boolean;
```

##### overlappingEvents

```ts
overlappingEvents: TEvent[];
```

##### start

```ts
start: string;
```

##### style?

```ts
optional style: object;
```

###### style.height

```ts
height: string;
```

###### style.left

```ts
left: string;
```

###### style.top

```ts
top: string;
```

###### style.width

```ts
width: string;
```

#### Inherited from

```ts
CalendarActions.getEventProps
```

***

### getEvents()

```ts
getEvents: () => TEvent[];
```

Defined in: [calendar/calendar.ts:135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L135)

Returns a snapshot of all events currently managed by the calendar (including those outside the visible range).

#### Returns

`TEvent`[]

#### Inherited from

```ts
CalendarActions.getEvents
```

***

### getEventsByDate()

```ts
getEventsByDate: (date) => TEvent[];
```

Defined in: [calendar/calendar.ts:113](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L113)

Retrieves events for a specific date.

#### Parameters

##### date

`string`

#### Returns

`TEvent`[]

#### Inherited from

```ts
CalendarActions.getEventsByDate
```

***

### getEventsByResource()

```ts
getEventsByResource: () => Map<TResource["id"], TEvent[]>;
```

Defined in: [calendar/calendar.ts:129](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L129)

Groups visible events by resource, merging multi-day segments back to full-span events.

#### Returns

`Map`\<`TResource`\[`"id"`\], `TEvent`[]\>

#### Inherited from

```ts
CalendarActions.getEventsByResource
```

***

### getTimelineLayout()

```ts
getTimelineLayout: () => TimelineLayout<TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:131](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L131)

Computes horizontal timeline layout with event positions, lane assignments, and current time marker.

#### Returns

[`TimelineLayout`](TimelineLayout.md)\<`TResource`, `TEvent`\>

#### Inherited from

```ts
CalendarActions.getTimelineLayout
```

***

### getTimeSlots()

```ts
getTimeSlots: (options?) => TimeSlot[];
```

Defined in: [calendar/calendar.ts:109](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L109)

Retrieves time slots for day view with configurable intervals.

#### Parameters

##### options?

`TimeSlotOptions`

#### Returns

[`TimeSlot`](TimeSlot.md)[]

#### Inherited from

```ts
CalendarActions.getTimeSlots
```

***

### getUnavailableRanges()

```ts
getUnavailableRanges: (date, options?) => UnavailableRange[];
```

Defined in: [calendar/calendar.ts:121](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L121)

Retrieves unavailable time ranges for a specific date based on resource availability.

#### Parameters

##### date

`string`

##### options?

###### containerHeight?

`number`

###### resourceIds?

`TResource`\[`"id"`\][]

#### Returns

[`UnavailableRange`](UnavailableRange.md)[]

#### Inherited from

```ts
CalendarActions.getUnavailableRanges
```

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod: () => void;
```

Defined in: [calendar/calendar.ts:78](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L78)

Resets the view to the current period based on today's date.

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToCurrentPeriod
```

***

### goToNextPeriod()

```ts
goToNextPeriod: () => void;
```

Defined in: [calendar/calendar.ts:76](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L76)

Navigates to the next period according to the current view mode.

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToNextPeriod
```

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod: () => void;
```

Defined in: [calendar/calendar.ts:74](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L74)

Navigates to the previous period according to the current view mode.

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToPreviousPeriod
```

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod: (date) => void;
```

Defined in: [calendar/calendar.ts:80](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L80)

Navigates to a specific date.

#### Parameters

##### date

`string`

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToSpecificPeriod
```

***

### groupDaysBy()

```ts
groupDaysBy: (props) => (Day<TResource, TEvent> | null)[][];
```

Defined in: [calendar/calendar.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L103)

Groups days by a specified unit.

#### Parameters

##### props

###### days

([`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\> \| `null`)[]

###### fillMissingDays?

`boolean`

###### unit

`"week"` \| `"workWeek"`

#### Returns

([`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\> \| `null`)[][]

#### Inherited from

```ts
CalendarActions.groupDaysBy
```

***

### removeEvent()

```ts
removeEvent: (id) => void;
```

Defined in: [calendar/calendar.ts:119](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L119)

Removes an event by ID.

#### Parameters

##### id

`string`

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.removeEvent
```

***

### updateEvent()

```ts
updateEvent: (id, updates) => void;
```

Defined in: [calendar/calendar.ts:117](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L117)

Updates an existing event by ID.

#### Parameters

##### id

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.updateEvent
```

***

### validateEventDependencies()

```ts
validateEventDependencies: (event, dependsOn) => object;
```

Defined in: [calendar/calendar.ts:149](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L149)

Validates if placing an event with a specific start time satisfies all dependency constraints.

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

`string`[]

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

```ts
CalendarActions.validateEventDependencies
```

***

### validateMove()

```ts
validateMove: (eventId, newStart, newEnd, newResources?) => object;
```

Defined in: [calendar/calendar.ts:140](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L140)

Checks whether moving `eventId` to `[newStart, newEnd]` — and cascading
all finish-to-start dependents — would violate any resource availability.

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

##### newResources?

`TResource`[]

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

```ts
CalendarActions.validateMove
```

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/calendar.ts:170](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L170)

The current view mode of the calendar.

#### Inherited from

```ts
ConvertTemporalToString.viewMode
```
