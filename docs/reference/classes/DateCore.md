---
id: DateCore
title: DateCore
---

# Abstract Class: DateCore

Defined in: [calendar/date-core.ts:99](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L99)

## Extended by

- [`CalendarCore`](CalendarCore.md)

## Constructors

### Constructor

```ts
new DateCore(options): DateCore;
```

Defined in: [calendar/date-core.ts:110](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L110)

#### Parameters

##### options

[`DateCoreOptions`](../interfaces/DateCoreOptions.md)

#### Returns

`DateCore`

## Properties

### calendarId

```ts
calendarId: string;
```

Defined in: [calendar/date-core.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L103)

***

### formatters

```ts
formatters: object;
```

Defined in: [calendar/date-core.ts:105](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L105)

#### date

```ts
date: DateTimeFormat;
```

#### dateTime

```ts
dateTime: DateTimeFormat;
```

#### time

```ts
time: DateTimeFormat;
```

***

### options

```ts
options: ParsedDateCoreOptions;
```

Defined in: [calendar/date-core.ts:101](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L101)

***

### store

```ts
store: Store<CalendarStore>;
```

Defined in: [calendar/date-core.ts:100](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L100)

***

### timeZoneId

```ts
timeZoneId: string;
```

Defined in: [calendar/date-core.ts:104](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L104)

## Accessors

### activeDatePlain

#### Get Signature

```ts
get protected activeDatePlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:166](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L166)

##### Returns

`PlainDate`

***

### currentPeriodPlain

#### Get Signature

```ts
get protected currentPeriodPlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:170](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L170)

##### Returns

`PlainDate`

## Methods

### canGoNextPeriod()

```ts
canGoNextPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:499](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L499)

#### Returns

`boolean`

***

### canGoPreviousPeriod()

```ts
canGoPreviousPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:468](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L468)

#### Returns

`boolean`

***

### changeViewMode()

```ts
changeViewMode(newViewMode): void;
```

Defined in: [calendar/date-core.ts:319](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L319)

#### Parameters

##### newViewMode

[`ViewMode`](../interfaces/ViewMode.md)

#### Returns

`void`

***

### formatDate()

```ts
formatDate(date): string;
```

Defined in: [calendar/date-core.ts:194](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L194)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`string`

***

### formatDateTime()

```ts
formatDateTime(date): string;
```

Defined in: [calendar/date-core.ts:202](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L202)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`string`

***

### formatPeriod()

```ts
formatPeriod(date?, options?): string;
```

Defined in: [calendar/date-core.ts:182](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L182)

#### Parameters

##### date?

[`DateInput`](../type-aliases/DateInput.md)

##### options?

[`FormatPeriodOptions`](../interfaces/FormatPeriodOptions.md)

#### Returns

`string`

***

### formatTime()

```ts
formatTime(date): string;
```

Defined in: [calendar/date-core.ts:198](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L198)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`string`

***

### getCalendarDays()

```ts
protected getCalendarDays(): PlainDate[];
```

Defined in: [calendar/date-core.ts:220](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L220)

#### Returns

`PlainDate`[]

***

### getDateParts()

```ts
getDateParts(date, options?): DateParts;
```

Defined in: [calendar/date-core.ts:174](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L174)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

##### options?

[`GetDatePartsOptions`](../interfaces/GetDatePartsOptions.md)

#### Returns

[`DateParts`](../interfaces/DateParts.md)

***

### getDaysNames()

```ts
getDaysNames(weekday): string[];
```

Defined in: [calendar/date-core.ts:302](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L302)

#### Parameters

##### weekday

`"short"` | `"long"`

#### Returns

`string`[]

***

### getFirstDayOfMonth()

```ts
protected getFirstDayOfMonth(): PlainDate;
```

Defined in: [calendar/date-core.ts:206](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L206)

#### Returns

`PlainDate`

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:212](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L212)

#### Returns

`PlainDate`

***

### getWeekStartsOn()

```ts
getWeekStartsOn(): number;
```

Defined in: [calendar/date-core.ts:216](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L216)

#### Returns

`number`

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:429](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L429)

#### Returns

`void`

***

### goToNextPeriod()

```ts
goToNextPeriod(): void;
```

Defined in: [calendar/date-core.ts:381](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L381)

#### Returns

`void`

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod(): void;
```

Defined in: [calendar/date-core.ts:333](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L333)

#### Returns

`void`

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod(date): void;
```

Defined in: [calendar/date-core.ts:449](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L449)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`void`

***

### toPlainDate()

```ts
protected toPlainDate(isoDate): PlainDate;
```

Defined in: [calendar/date-core.ts:162](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L162)

#### Parameters

##### isoDate

`string`

#### Returns

`PlainDate`
