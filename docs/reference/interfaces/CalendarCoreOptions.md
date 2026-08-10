---
id: CalendarCoreOptions
title: CalendarCoreOptions
---

# Interface: CalendarCoreOptions\<TFeatures, TResource, TEvent\>

Defined in: [calendar/calendar.ts:56](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L56)

## Extends

- [`DateCoreOptions`](DateCoreOptions.md)

## Type Parameters

### TFeatures

`TFeatures` *extends* [`CalendarFeatureList`](../type-aliases/CalendarFeatureList.md)

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\> = [`Event`](Event.md)\<`TResource`\>

## Properties

### calendar?

```ts
optional calendar: CalendarLike;
```

Defined in: [calendar/date-core.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L60)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`calendar`](DateCoreOptions.md#calendar)

***

### calendars?

```ts
optional calendars: WorkingCalendar[] | null;
```

Defined in: [calendar/calendar.ts:67](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L67)

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

### defaultCalendarId?

```ts
optional defaultCalendarId: string;
```

Defined in: [calendar/calendar.ts:69](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L69)

***

### events?

```ts
optional events: NoInfer<TEvent>[] | null;
```

Defined in: [calendar/calendar.ts:63](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L63)

***

### features

```ts
features: TFeatures;
```

Defined in: [calendar/calendar.ts:61](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L61)

***

### fetchEvents()?

```ts
optional fetchEvents: (range) => Promise<NoInfer<TEvent>[]>;
```

Defined in: [calendar/calendar.ts:73](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L73)

#### Parameters

##### range

###### end

`string`

###### start

`string`

#### Returns

`Promise`\<`NoInfer`\<`TEvent`\>[]\>

***

### layout?

```ts
optional layout: LayoutOptions;
```

Defined in: [calendar/calendar.ts:78](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L78)

***

### locale?

```ts
optional locale: string;
```

Defined in: [calendar/date-core.ts:56](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L56)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`locale`](DateCoreOptions.md#locale)

***

### multiResource?

```ts
optional multiResource: "intersection" | "union";
```

Defined in: [calendar/calendar.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L71)

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

Defined in: [calendar/calendar.ts:65](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L65)

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
