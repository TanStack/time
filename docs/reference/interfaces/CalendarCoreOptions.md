---
id: CalendarCoreOptions
title: CalendarCoreOptions
---

# Interface: CalendarCoreOptions\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:97](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L97)

## Extends

- [`DateCoreOptions`](DateCoreOptions.md)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### calendar?

```ts
optional calendar: CalendarLike;
```

Defined in: [calendar/date-core.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L60)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`calendar`](DateCoreOptions.md#calendar)

***

### dateFormatter?

```ts
optional dateFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L64)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`dateFormatter`](DateCoreOptions.md#dateformatter)

***

### dateTimeFormatter?

```ts
optional dateTimeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L68)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`dateTimeFormatter`](DateCoreOptions.md#datetimeformatter)

***

### events?

```ts
optional events: TEvent[] | null;
```

Defined in: [calendar/calendar.ts:101](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L101)

***

### fetchEvents()?

```ts
optional fetchEvents: (range) => Promise<TEvent[]>;
```

Defined in: [calendar/calendar.ts:105](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L105)

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

Defined in: [calendar/calendar.ts:110](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L110)

***

### locale?

```ts
optional locale: string;
```

Defined in: [calendar/date-core.ts:56](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L56)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`locale`](DateCoreOptions.md#locale)

***

### range?

```ts
optional range: DateRange;
```

Defined in: [calendar/date-core.ts:62](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L62)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`range`](DateCoreOptions.md#range)

***

### resources?

```ts
optional resources: TResource[] | null;
```

Defined in: [calendar/calendar.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L103)

***

### timeFormatter?

```ts
optional timeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L66)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`timeFormatter`](DateCoreOptions.md#timeformatter)

***

### timeZone?

```ts
optional timeZone: TimeZoneLike;
```

Defined in: [calendar/date-core.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L58)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`timeZone`](DateCoreOptions.md#timezone)

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/date-core.ts:54](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L54)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`viewMode`](DateCoreOptions.md#viewmode)
