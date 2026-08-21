---
id: DateCore
title: DateCore
---

# Abstract Class: DateCore

Defined in: [calendar/date-core.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L103)

## Extended by

- [`CalendarCore`](CalendarCore.md)

## Constructors

### Constructor

```ts
new DateCore(options): DateCore;
```

Defined in: [calendar/date-core.ts:114](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L114)

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

Defined in: [calendar/date-core.ts:107](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L107)

***

### formatters

```ts
formatters: object;
```

Defined in: [calendar/date-core.ts:109](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L109)

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

Defined in: [calendar/date-core.ts:105](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L105)

***

### store

```ts
store: Store<CalendarStore>;
```

Defined in: [calendar/date-core.ts:104](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L104)

***

### timeZoneId

```ts
timeZoneId: string;
```

Defined in: [calendar/date-core.ts:108](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L108)

## Accessors

### activeDatePlain

#### Get Signature

```ts
get protected activeDatePlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:170](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L170)

##### Returns

`PlainDate`

***

### currentPeriodPlain

#### Get Signature

```ts
get protected currentPeriodPlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:174](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L174)

##### Returns

`PlainDate`

## Methods

### canGoNextPeriod()

```ts
canGoNextPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:523](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L523)

#### Returns

`boolean`

***

### canGoPreviousPeriod()

```ts
canGoPreviousPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:492](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L492)

#### Returns

`boolean`

***

### changeViewMode()

```ts
changeViewMode(newViewMode): void;
```

Defined in: [calendar/date-core.ts:343](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L343)

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

Defined in: [calendar/date-core.ts:203](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L203)

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

Defined in: [calendar/date-core.ts:211](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L211)

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

Defined in: [calendar/date-core.ts:186](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L186)

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

Defined in: [calendar/date-core.ts:207](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L207)

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

Defined in: [calendar/date-core.ts:234](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L234)

#### Returns

`PlainDate`[]

***

### getDateParts()

```ts
getDateParts(date, options?): DateParts;
```

Defined in: [calendar/date-core.ts:178](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L178)

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

Defined in: [calendar/date-core.ts:326](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L326)

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

Defined in: [calendar/date-core.ts:215](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L215)

#### Returns

`PlainDate`

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:223](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L223)

#### Returns

`PlainDate`

***

### getWeekStartsOn()

```ts
getWeekStartsOn(): number;
```

Defined in: [calendar/date-core.ts:230](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L230)

#### Returns

`number`

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:453](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L453)

#### Returns

`void`

***

### goToNextPeriod()

```ts
goToNextPeriod(): void;
```

Defined in: [calendar/date-core.ts:405](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L405)

#### Returns

`void`

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod(): void;
```

Defined in: [calendar/date-core.ts:357](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L357)

#### Returns

`void`

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod(date): void;
```

Defined in: [calendar/date-core.ts:471](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L471)

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

Defined in: [calendar/date-core.ts:166](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L166)

#### Parameters

##### isoDate

`string`

#### Returns

`PlainDate`
