---
id: DateCore
title: DateCore
---

# Abstract Class: DateCore

Defined in: [calendar/date-core.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L83)

## Extended by

- [`CalendarCore`](CalendarCore.md)

## Constructors

### Constructor

```ts
new DateCore(options): DateCore;
```

Defined in: [calendar/date-core.ts:91](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L91)

#### Parameters

##### options

[`DateCoreOptions`](../interfaces/DateCoreOptions.md)

#### Returns

`DateCore`

## Properties

### formatters

```ts
formatters: object;
```

Defined in: [calendar/date-core.ts:86](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L86)

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

Defined in: [calendar/date-core.ts:85](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L85)

***

### store

```ts
store: Store<CalendarStore>;
```

Defined in: [calendar/date-core.ts:84](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L84)

## Accessors

### activeDatePlain

#### Get Signature

```ts
get protected activeDatePlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:141](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L141)

##### Returns

`PlainDate`

***

### currentPeriodPlain

#### Get Signature

```ts
get protected currentPeriodPlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:145](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L145)

##### Returns

`PlainDate`

## Methods

### canGoNextPeriod()

```ts
canGoNextPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:463](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L463)

#### Returns

`boolean`

***

### canGoPreviousPeriod()

```ts
canGoPreviousPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:432](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L432)

#### Returns

`boolean`

***

### changeViewMode()

```ts
changeViewMode(newViewMode): void;
```

Defined in: [calendar/date-core.ts:283](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L283)

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

Defined in: [calendar/date-core.ts:149](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L149)

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

Defined in: [calendar/date-core.ts:157](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L157)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`string`

***

### formatTime()

```ts
formatTime(date): string;
```

Defined in: [calendar/date-core.ts:153](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L153)

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

Defined in: [calendar/date-core.ts:180](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L180)

#### Returns

`PlainDate`[]

***

### getDaysNames()

```ts
getDaysNames(weekday): string[];
```

Defined in: [calendar/date-core.ts:272](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L272)

#### Parameters

##### weekday

`"long"` | `"short"`

#### Returns

`string`[]

***

### getFirstDayOfMonth()

```ts
protected getFirstDayOfMonth(): PlainDate;
```

Defined in: [calendar/date-core.ts:161](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L161)

#### Returns

`PlainDate`

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:169](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L169)

#### Returns

`PlainDate`

***

### getWeekStartsOn()

```ts
getWeekStartsOn(): number;
```

Defined in: [calendar/date-core.ts:176](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L176)

#### Returns

`number`

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:393](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L393)

#### Returns

`void`

***

### goToNextPeriod()

```ts
goToNextPeriod(): void;
```

Defined in: [calendar/date-core.ts:345](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L345)

#### Returns

`void`

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod(): void;
```

Defined in: [calendar/date-core.ts:297](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L297)

#### Returns

`void`

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod(date): void;
```

Defined in: [calendar/date-core.ts:411](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L411)

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

Defined in: [calendar/date-core.ts:137](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L137)

#### Parameters

##### isoDate

`string`

#### Returns

`PlainDate`
