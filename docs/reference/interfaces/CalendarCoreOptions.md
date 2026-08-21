---
id: CalendarCoreOptions
title: CalendarCoreOptions
---

# Interface: CalendarCoreOptions\<TFeatures, TResource, TEvent\>

Defined in: [calendar/calendar.ts:59](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L59)

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

Defined in: [calendar/date-core.ts:70](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L70)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`calendar`](DateCoreOptions.md#calendar)

***

### calendars?

```ts
optional calendars: WorkingCalendar[] | null;
```

Defined in: [calendar/calendar.ts:70](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L70)

***

### dateFormatter?

```ts
optional dateFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:74](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L74)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`dateFormatter`](DateCoreOptions.md#dateformatter)

***

### dateTimeFormatter?

```ts
optional dateTimeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:78](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L78)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`dateTimeFormatter`](DateCoreOptions.md#datetimeformatter)

***

### defaultCalendarId?

```ts
optional defaultCalendarId: string;
```

Defined in: [calendar/calendar.ts:72](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L72)

***

### events?

```ts
optional events: NoInfer<TEvent>[] | null;
```

Defined in: [calendar/calendar.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L66)

***

### features

```ts
features: TFeatures;
```

Defined in: [calendar/calendar.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L64)

***

### fetchEvents()?

```ts
optional fetchEvents: (range) => Promise<NoInfer<TEvent>[]>;
```

Defined in: [calendar/calendar.ts:76](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L76)

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

Defined in: [calendar/calendar.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L81)

***

### locale?

```ts
optional locale: string;
```

Defined in: [calendar/date-core.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L66)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`locale`](DateCoreOptions.md#locale)

***

### multiResource?

```ts
optional multiResource: "intersection" | "union";
```

Defined in: [calendar/calendar.ts:74](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L74)

***

### range?

```ts
optional range: DateRange;
```

Defined in: [calendar/date-core.ts:72](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L72)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`range`](DateCoreOptions.md#range)

***

### resources?

```ts
optional resources: TResource[] | null;
```

Defined in: [calendar/calendar.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L68)

***

### timeFormatter?

```ts
optional timeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:76](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L76)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`timeFormatter`](DateCoreOptions.md#timeformatter)

***

### timeZone?

```ts
optional timeZone: TimeZoneLike;
```

Defined in: [calendar/date-core.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L68)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`timeZone`](DateCoreOptions.md#timezone)

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/date-core.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L64)

#### Inherited from

[`DateCoreOptions`](DateCoreOptions.md).[`viewMode`](DateCoreOptions.md#viewmode)
