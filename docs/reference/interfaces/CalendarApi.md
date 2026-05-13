---
id: CalendarApi
title: CalendarApi
---

# Interface: CalendarApi\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:229](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L229)

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

Defined in: [calendar/calendar.ts:222](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L222)

The currently active date in the calendar.

#### Inherited from

```ts
ConvertTemporalToString.activeDate
```

***

### addEvent()

```ts
addEvent: (event, options?) => Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:124](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L124)

Fetches events for the event's date range, validates placement
constraints, and adds the event if valid. Returns a result
indicating success or a validation error.

#### Parameters

##### event

`TEvent`

##### options?

###### dependsOn?

[`EventDependency`](EventDependency.md)[]

#### Returns

`Promise`\<[`SaveEventResult`](../type-aliases/SaveEventResult.md)\>

#### Inherited from

```ts
CalendarActions.addEvent
```

***

### canGoNextPeriod()

```ts
canGoNextPeriod: () => boolean;
```

Defined in: [calendar/calendar.ts:89](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L89)

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

Defined in: [calendar/calendar.ts:87](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L87)

Checks if navigation to the previous period is allowed within the range.

#### Returns

`boolean`

#### Inherited from

```ts
CalendarActions.canGoPreviousPeriod
```

***

### canRedo()

```ts
canRedo: () => boolean;
```

Defined in: [calendar/calendar.ts:163](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L163)

Returns true when there is at least one action to redo.

#### Returns

`boolean`

#### Inherited from

```ts
CalendarActions.canRedo
```

***

### canUndo()

```ts
canUndo: () => boolean;
```

Defined in: [calendar/calendar.ts:161](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L161)

Returns true when there is at least one action to undo.

#### Returns

`boolean`

#### Inherited from

```ts
CalendarActions.canUndo
```

***

### changeViewMode()

```ts
changeViewMode: (newViewMode) => void;
```

Defined in: [calendar/calendar.ts:91](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L91)

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
createDependency: (sourceId, targetId, type?) => object;
```

Defined in: [calendar/calendar.ts:186](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L186)

Creates a dependency link from source to target event.
If the target event starts before the source event ends, it will optionally reschedule the target.

#### Parameters

##### sourceId

`string`

##### targetId

`string`

##### type?

[`DependencyType`](../type-aliases/DependencyType.md)

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

Defined in: [calendar/calendar.ts:216](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L216)

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

Defined in: [calendar/calendar.ts:220](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L220)

An array of days, each potentially containing events.

#### Inherited from

```ts
ConvertTemporalToString.days
```

***

### editEvent()

```ts
editEvent: (eventId, updates, options?) => Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:133](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L133)

Fetches events for the event's date range, validates move constraints
(and cascading dependents), and updates the event if valid.
Returns a result indicating success or a validation error.

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

```ts
CalendarActions.editEvent
```

***

### fetchEventsForRange()

```ts
fetchEventsForRange: (start, end) => Promise<void>;
```

Defined in: [calendar/calendar.ts:197](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L197)

Fetches events for an arbitrary date range from the configured
`fetchEvents` callback and merges them into the calendar.
Resolves immediately if `fetchEvents` is not configured or the range
is already loaded.

#### Parameters

##### start

`string`

##### end

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

```ts
CalendarActions.fetchEventsForRange
```

***

### formatPeriodLabel()

```ts
formatPeriodLabel: (options?) => string;
```

Defined in: [calendar/calendar.ts:153](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L153)

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

Defined in: [calendar/calendar.ts:106](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L106)

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

Defined in: [calendar/calendar.ts:93](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L93)

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

Defined in: [calendar/calendar.ts:155](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L155)

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

Defined in: [calendar/calendar.ts:118](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L118)

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

Defined in: [calendar/calendar.ts:149](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L149)

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

Defined in: [calendar/calendar.ts:151](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L151)

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

Defined in: [calendar/calendar.ts:114](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L114)

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

Defined in: [calendar/calendar.ts:141](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L141)

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

Defined in: [calendar/calendar.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L83)

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

Defined in: [calendar/calendar.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L81)

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

Defined in: [calendar/calendar.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L79)

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

Defined in: [calendar/calendar.ts:85](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L85)

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

Defined in: [calendar/calendar.ts:108](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L108)

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

### redo()

```ts
redo: () => void;
```

Defined in: [calendar/calendar.ts:159](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L159)

Re-applies the last undone action.

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.redo
```

***

### removeEvent()

```ts
removeEvent: (id) => void;
```

Defined in: [calendar/calendar.ts:139](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L139)

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

### undo()

```ts
undo: () => void;
```

Defined in: [calendar/calendar.ts:157](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L157)

Reverts the last mutating action (commitAdd, commitUpdate, removeEvent).

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.undo
```

***

### validateEventDependencies()

```ts
validateEventDependencies: (event, dependsOn) => object;
```

Defined in: [calendar/calendar.ts:178](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L178)

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

```ts
CalendarActions.validateEventDependencies
```

***

### validateEventPlacement()

```ts
validateEventPlacement: (event) => object;
```

Defined in: [calendar/calendar.ts:203](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L203)

Validates whether a new event (not yet added to the calendar) can be
placed at the given time slot without violating resource availability.
Use this for standalone validation before manually committing events.

#### Parameters

##### event

###### end

`string`

###### resources?

`TResource`[]

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

```ts
CalendarActions.validateEventPlacement
```

***

### validateMove()

```ts
validateMove: (eventId, newStart, newEnd, newResources?, newConsumption?) => object;
```

Defined in: [calendar/calendar.ts:168](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L168)

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

```ts
CalendarActions.validateMove
```

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/calendar.ts:218](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L218)

The current view mode of the calendar.

#### Inherited from

```ts
ConvertTemporalToString.viewMode
```
