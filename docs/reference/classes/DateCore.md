---
id: DateCore
title: DateCore
---

# Abstract Class: DateCore

Defined in: [calendar/date-core.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L79)

## Extended by

- [`CalendarCore`](CalendarCore.md)

## Constructors

### Constructor

```ts
new DateCore(options): DateCore;
```

Defined in: [calendar/date-core.ts:88](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L88)

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

Defined in: [calendar/date-core.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L83)

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

Defined in: [calendar/date-core.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L81)

***

### store

```ts
store: Store<CalendarStore>;
```

Defined in: [calendar/date-core.ts:80](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L80)

## Accessors

### activeDatePlain

#### Get Signature

```ts
get protected activeDatePlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:138](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L138)

##### Returns

`PlainDate`

***

### currentPeriodPlain

#### Get Signature

```ts
get protected currentPeriodPlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:142](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L142)

##### Returns

`PlainDate`

## Methods

### canGoNextPeriod()

```ts
canGoNextPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:466](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L466)

#### Returns

`boolean`

***

### canGoPreviousPeriod()

```ts
canGoPreviousPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:435](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L435)

#### Returns

`boolean`

***

### changeViewMode()

```ts
changeViewMode(newViewMode): void;
```

Defined in: [calendar/date-core.ts:286](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L286)

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

Defined in: [calendar/date-core.ts:146](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L146)

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

Defined in: [calendar/date-core.ts:154](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L154)

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

Defined in: [calendar/date-core.ts:150](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L150)

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

Defined in: [calendar/date-core.ts:177](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L177)

#### Returns

`PlainDate`[]

***

### getDaysNames()

```ts
getDaysNames(weekday): string[];
```

Defined in: [calendar/date-core.ts:269](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L269)

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

Defined in: [calendar/date-core.ts:158](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L158)

#### Returns

`PlainDate`

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:166](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L166)

#### Returns

`PlainDate`

***

### getWeekStartsOn()

```ts
getWeekStartsOn(): number;
```

Defined in: [calendar/date-core.ts:173](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L173)

#### Returns

`number`

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:396](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L396)

#### Returns

`void`

***

### goToNextPeriod()

```ts
goToNextPeriod(): void;
```

Defined in: [calendar/date-core.ts:348](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L348)

#### Returns

`void`

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod(): void;
```

Defined in: [calendar/date-core.ts:300](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L300)

#### Returns

`void`

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod(date): void;
```

Defined in: [calendar/date-core.ts:414](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L414)

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

Defined in: [calendar/date-core.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L134)

#### Parameters

##### isoDate

`string`

#### Returns

`PlainDate`
