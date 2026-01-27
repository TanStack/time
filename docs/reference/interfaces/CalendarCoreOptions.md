---
id: CalendarCoreOptions
title: CalendarCoreOptions
---

# Interface: CalendarCoreOptions\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L24)

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

Defined in: [calendar/date-core.ts:59](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L59)

Optional calendar system to be used.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`calendar`](DateCoreOptions.md#calendar)

***

### dateFormatter?

```ts
optional dateFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:63](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L63)

Optional date formatter.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`dateFormatter`](DateCoreOptions.md#dateformatter)

***

### dateTimeFormatter?

```ts
optional dateTimeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:67](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L67)

Optional date time formatter.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`dateTimeFormatter`](DateCoreOptions.md#datetimeformatter)

***

### events?

```ts
optional events: TEvent[] | null;
```

Defined in: [calendar/calendar.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L29)

An optional array of events to be handled by the calendar.

***

### locale?

```ts
optional locale: string;
```

Defined in: [calendar/date-core.ts:55](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L55)

Optional locale for date formatting. Uses a BCP 47 language tag.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`locale`](DateCoreOptions.md#locale)

***

### range?

```ts
optional range: DateRange;
```

Defined in: [calendar/date-core.ts:61](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L61)

Optional range of dates to be used.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`range`](DateCoreOptions.md#range)

***

### resources?

```ts
optional resources: TResource[] | null;
```

Defined in: [calendar/calendar.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L31)

Optional resources to be used in the calendar.

***

### timeFormatter?

```ts
optional timeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:65](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L65)

Optional time formatter.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`timeFormatter`](DateCoreOptions.md#timeformatter)

***

### timeZone?

```ts
optional timeZone: TimeZoneLike;
```

Defined in: [calendar/date-core.ts:57](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L57)

Optional time zone specification.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`timeZone`](DateCoreOptions.md#timezone)

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/date-core.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L53)

The initial view mode configuration.

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`viewMode`](DateCoreOptions.md#viewmode)
