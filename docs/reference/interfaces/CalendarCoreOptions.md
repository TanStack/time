---
id: CalendarCoreOptions
title: CalendarCoreOptions
---

# Interface: CalendarCoreOptions\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:126](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L126)

Configuration options for initializing a CalendarCore instance, allowing customization
of events, locale, time zone, and the calendar system.

## Extends

- [`DateCoreOptions`](DateCoreOptions.md)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

Specifies the event type, extending a base Event type.

## Properties

### calendar?

```ts
optional calendar: CalendarLike;
```

Defined in: [calendar/date-core.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L64)

Optional calendar system to be used.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`calendar`](DateCoreOptions.md#calendar)

***

### dateFormatter?

```ts
optional dateFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L68)

Optional date formatter.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`dateFormatter`](DateCoreOptions.md#dateformatter)

***

### dateTimeFormatter?

```ts
optional dateTimeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:72](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L72)

Optional date time formatter.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`dateTimeFormatter`](DateCoreOptions.md#datetimeformatter)

***

### events?

```ts
optional events: TEvent[] | null;
```

Defined in: [calendar/calendar.ts:131](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L131)

An optional array of events to be handled by the calendar.

***

### fetchEvents()?

```ts
optional fetchEvents: (range) => Promise<TEvent[]>;
```

Defined in: [calendar/calendar.ts:140](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L140)

Optional async callback for lazy/on-demand event loading.
Called whenever the current viewport window is not yet fully loaded.
The returned events are merged into the internal indices automatically.
When omitted the calendar operates in fully-eager mode (no change in behaviour).

#### Parameters

##### range

###### end

`string`

###### start

`string`

#### Returns

`Promise`\<`TEvent`[]\>

***

### layout?

```ts
optional layout: LayoutOptions;
```

Defined in: [calendar/calendar.ts:145](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L145)

How concurrent events share the cross axis. Overridable per `getEventProps` call.

***

### locale?

```ts
optional locale: string;
```

Defined in: [calendar/date-core.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L60)

Optional locale for date formatting. Uses a BCP 47 language tag.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`locale`](DateCoreOptions.md#locale)

***

### range?

```ts
optional range: DateRange;
```

Defined in: [calendar/date-core.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L66)

Optional range of dates to be used.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`range`](DateCoreOptions.md#range)

***

### resources?

```ts
optional resources: TResource[] | null;
```

Defined in: [calendar/calendar.ts:133](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L133)

Optional resources to be used in the calendar.

***

### timeFormatter?

```ts
optional timeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:70](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L70)

Optional time formatter.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`timeFormatter`](DateCoreOptions.md#timeformatter)

***

### timeZone?

```ts
optional timeZone: TimeZoneLike;
```

Defined in: [calendar/date-core.ts:62](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L62)

Optional time zone specification.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`timeZone`](DateCoreOptions.md#timezone)

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/date-core.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L58)

The initial view mode configuration.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`viewMode`](DateCoreOptions.md#viewmode)
