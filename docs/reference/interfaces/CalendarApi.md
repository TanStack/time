---
id: CalendarApi
title: CalendarApi
---

# Interface: CalendarApi\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:329](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L329)

## Extends

- `CalendarActions`\<`TResource`, `TEvent`\>.`CalendarState`\<`TResource`, `TEvent`\>

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

Defined in: [calendar/calendar.ts:326](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L326)

The currently active date in the calendar.

#### Inherited from

```ts
CalendarState.activeDate
```

***

### addEvent()

```ts
addEvent: (event, options?) => Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:198](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L198)

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

Defined in: [calendar/calendar.ts:144](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L144)

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

Defined in: [calendar/calendar.ts:142](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L142)

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

Defined in: [calendar/calendar.ts:265](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L265)

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

Defined in: [calendar/calendar.ts:263](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L263)

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

Defined in: [calendar/calendar.ts:163](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L163)

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

Defined in: [calendar/calendar.ts:288](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L288)

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

Defined in: [calendar/calendar.ts:320](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L320)

The currently focused date period in the calendar.

#### Inherited from

```ts
CalendarState.currentPeriod
```

***

### days

```ts
days: Day<TResource, TEvent>[];
```

Defined in: [calendar/calendar.ts:324](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L324)

An array of days, each potentially containing events.

#### Inherited from

```ts
CalendarState.days
```

***

### editEvent()

```ts
editEvent: (eventId, updates, options?) => Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:207](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L207)

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

### editRecurringEvent()

```ts
editRecurringEvent: (eventId, updates, options) => Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:213](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L213)

Edits one occurrence, this-and-following occurrences, or the whole recurring series.

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

#### Inherited from

```ts
CalendarActions.editRecurringEvent
```

***

### fetchEventsForRange()

```ts
fetchEventsForRange: (start, end) => Promise<void>;
```

Defined in: [calendar/calendar.ts:299](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L299)

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

### formatCurrentPeriod()

```ts
formatCurrentPeriod: (options?) => string;
```

Defined in: [calendar/calendar.ts:246](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L246)

Formats the current period as a human-readable "Month Year" string (e.g. "January 2024").

#### Parameters

##### options?

###### locale?

`string`

#### Returns

`string`

#### Inherited from

```ts
CalendarActions.formatCurrentPeriod
```

***

### formatPeriodLabel()

```ts
formatPeriodLabel: (options?) => string;
```

Defined in: [calendar/calendar.ts:244](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L244)

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

### getAllDayEventsByDate()

```ts
getAllDayEventsByDate: (date) => TEvent[];
```

Defined in: [calendar/calendar.ts:192](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L192)

Retrieves all-day events occurring on a specific date (multi-day all-day segments included).

#### Parameters

##### date

`string`

#### Returns

`TEvent`[]

#### Inherited from

```ts
CalendarActions.getAllDayEventsByDate
```

***

### getDaysInRange()

```ts
getDaysInRange: (start, end) => Day<TResource, TEvent>[];
```

Defined in: [calendar/calendar.ts:255](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L255)

Returns Day objects for every date between `start` and `end` (inclusive),
derived freshly from current event state. Useful for buffered/infinite-scroll
UIs that need to render a range wider than the current period without
caching stale Day snapshots.

#### Parameters

##### start

`string`

##### end

`string`

#### Returns

[`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\>[]

#### Inherited from

```ts
CalendarActions.getDaysInRange
```

***

### getDaysNames()

```ts
getDaysNames: (weekday?) => string[];
```

Defined in: [calendar/calendar.ts:178](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L178)

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
getEventProps: (event, layoutOptions?) => object;
```

Defined in: [calendar/calendar.ts:165](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L165)

Retrieves styling properties for a specific event.

#### Parameters

##### event

`TEvent`

##### layoutOptions?

[`LayoutOptions`](LayoutOptions.md)

#### Returns

##### end

```ts
end: string;
```

##### isSplitEvent

```ts
isSplitEvent: boolean;
```

##### layout?

```ts
optional layout: EventLayout;
```

Logical layout of the event within its day, free of pixels and orientation.

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
optional style: LayoutStyle;
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

Defined in: [calendar/calendar.ts:257](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L257)

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

Defined in: [calendar/calendar.ts:190](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L190)

Retrieves all events for a specific date.

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

Defined in: [calendar/calendar.ts:240](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L240)

Groups visible events by resource, merging multi-day segments back to full-span events.

#### Returns

`Map`\<`TResource`\[`"id"`\], `TEvent`[]\>

#### Inherited from

```ts
CalendarActions.getEventsByResource
```

***

### getEventSegmentInfo()

```ts
getEventSegmentInfo: (event) => SegmentInfo;
```

Defined in: [calendar/calendar.ts:248](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L248)

Returns segment info (split/occurrence metadata) for an event, normalising flexible datetime inputs.

#### Parameters

##### event

`TEvent`

#### Returns

[`SegmentInfo`](SegmentInfo.md)

#### Inherited from

```ts
CalendarActions.getEventSegmentInfo
```

***

### getMasterEvent()

```ts
getMasterEvent: (event) => TEvent;
```

Defined in: [calendar/calendar.ts:161](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L161)

Returns the master event for a given occurrence (or the event itself if it is already the master).

#### Parameters

##### event

`TEvent`

#### Returns

`TEvent`

#### Inherited from

```ts
CalendarActions.getMasterEvent
```

***

### getTimelineLayout()

```ts
getTimelineLayout: () => TimelineLayout<TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:242](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L242)

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

Defined in: [calendar/calendar.ts:186](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L186)

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

Defined in: [calendar/calendar.ts:233](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L233)

Retrieves unavailable time ranges for a specific date based on resource availability.

#### Parameters

##### date

`string`

##### options?

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

Defined in: [calendar/calendar.ts:138](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L138)

Resets the view to the current period based on today's date.

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToCurrentPeriod
```

***

### goToNextOccurrence()

```ts
goToNextOccurrence: (eventId, fromDate?) => void;
```

Defined in: [calendar/calendar.ts:149](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L149)

Navigates to the next occurrence of a recurring event after fromDate (defaults to activeDate).
No-op when the event is not recurring or has no future occurrences.

#### Parameters

##### eventId

`string`

##### fromDate?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToNextOccurrence
```

***

### goToNextPeriod()

```ts
goToNextPeriod: () => void;
```

Defined in: [calendar/calendar.ts:136](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L136)

Navigates to the next period according to the current view mode.

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToNextPeriod
```

***

### goToPreviousOccurrence()

```ts
goToPreviousOccurrence: (eventId, fromDate?) => void;
```

Defined in: [calendar/calendar.ts:154](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L154)

Navigates to the previous occurrence of a recurring event before fromDate (defaults to activeDate).
No-op when the event is not recurring or is already at the first occurrence.

#### Parameters

##### eventId

`string`

##### fromDate?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToPreviousOccurrence
```

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod: () => void;
```

Defined in: [calendar/calendar.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L134)

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

Defined in: [calendar/calendar.ts:140](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L140)

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

Defined in: [calendar/calendar.ts:180](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L180)

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

Defined in: [calendar/calendar.ts:261](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L261)

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

Defined in: [calendar/calendar.ts:231](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L231)

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

### removeRecurringEvent()

```ts
removeRecurringEvent: (eventId, options) => void;
```

Defined in: [calendar/calendar.ts:223](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L223)

Removes one occurrence, this-and-following occurrences, or the whole recurring series.

#### Parameters

##### eventId

`string`

##### options

###### occurrenceStart?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

###### scope

[`RecurrenceEditScope`](../type-aliases/RecurrenceEditScope.md)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.removeRecurringEvent
```

***

### setEvents()

```ts
setEvents: (events) => void;
```

Defined in: [calendar/calendar.ts:312](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L312)

#### Parameters

##### events

`TEvent`[] | `null`

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.setEvents
```

***

### setResources()

```ts
setResources: (resources) => void;
```

Defined in: [calendar/calendar.ts:311](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L311)

#### Parameters

##### resources

`TResource`[] | `null`

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.setResources
```

***

### undo()

```ts
undo: () => void;
```

Defined in: [calendar/calendar.ts:259](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L259)

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

Defined in: [calendar/calendar.ts:280](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L280)

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

Defined in: [calendar/calendar.ts:305](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L305)

Validates whether a new event (not yet added to the calendar) can be
placed at the given time slot without violating resource availability.
Use this for standalone validation before manually committing events.

#### Parameters

##### event

###### end

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

```ts
CalendarActions.validateEventPlacement
```

***

### validateMove()

```ts
validateMove: (eventId, newStart, newEnd, newResources?, newConsumption?) => object;
```

Defined in: [calendar/calendar.ts:270](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L270)

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

```ts
CalendarActions.validateMove
```

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/calendar.ts:322](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L322)

The current view mode of the calendar.

#### Inherited from

```ts
CalendarState.viewMode
```
