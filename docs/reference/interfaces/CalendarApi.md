---
id: CalendarApi
title: CalendarApi
---

# Interface: CalendarApi\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:307](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L307)

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

Defined in: [calendar/calendar.ts:300](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L300)

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

Defined in: [calendar/calendar.ts:172](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L172)

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

Defined in: [calendar/calendar.ts:121](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L121)

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

Defined in: [calendar/calendar.ts:119](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L119)

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

Defined in: [calendar/calendar.ts:239](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L239)

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

Defined in: [calendar/calendar.ts:237](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L237)

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

Defined in: [calendar/calendar.ts:140](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L140)

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

Defined in: [calendar/calendar.ts:262](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L262)

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

Defined in: [calendar/calendar.ts:294](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L294)

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

Defined in: [calendar/calendar.ts:298](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L298)

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

Defined in: [calendar/calendar.ts:181](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L181)

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

Defined in: [calendar/calendar.ts:187](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L187)

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

Defined in: [calendar/calendar.ts:273](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L273)

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

Defined in: [calendar/calendar.ts:220](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L220)

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

Defined in: [calendar/calendar.ts:218](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L218)

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

Defined in: [calendar/calendar.ts:166](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L166)

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

Defined in: [calendar/calendar.ts:229](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L229)

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

Defined in: [calendar/calendar.ts:152](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L152)

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

Defined in: [calendar/calendar.ts:142](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L142)

Retrieves styling properties for a specific event.

#### Parameters

##### event

`TEvent`

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

Defined in: [calendar/calendar.ts:231](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L231)

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

Defined in: [calendar/calendar.ts:164](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L164)

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

Defined in: [calendar/calendar.ts:214](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L214)

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

Defined in: [calendar/calendar.ts:222](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L222)

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

Defined in: [calendar/calendar.ts:138](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L138)

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

Defined in: [calendar/calendar.ts:216](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L216)

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

Defined in: [calendar/calendar.ts:160](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L160)

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

Defined in: [calendar/calendar.ts:207](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L207)

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

Defined in: [calendar/calendar.ts:115](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L115)

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

Defined in: [calendar/calendar.ts:126](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L126)

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

Defined in: [calendar/calendar.ts:113](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L113)

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

Defined in: [calendar/calendar.ts:131](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L131)

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

Defined in: [calendar/calendar.ts:111](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L111)

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

Defined in: [calendar/calendar.ts:117](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L117)

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

Defined in: [calendar/calendar.ts:154](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L154)

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

Defined in: [calendar/calendar.ts:235](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L235)

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

Defined in: [calendar/calendar.ts:205](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L205)

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

Defined in: [calendar/calendar.ts:197](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L197)

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

Defined in: [calendar/calendar.ts:286](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L286)

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

Defined in: [calendar/calendar.ts:285](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L285)

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

Defined in: [calendar/calendar.ts:233](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L233)

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

Defined in: [calendar/calendar.ts:254](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L254)

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

Defined in: [calendar/calendar.ts:279](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L279)

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

Defined in: [calendar/calendar.ts:244](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L244)

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

Defined in: [calendar/calendar.ts:296](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L296)

The current view mode of the calendar.

#### Inherited from

```ts
ConvertTemporalToString.viewMode
```
