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

Defined in: [calendar/date-core.ts:87](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L87)

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

Defined in: [calendar/date-core.ts:82](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L82)

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

## Methods

### canGoNextPeriod()

```ts
canGoNextPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:447](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L447)

#### Returns

`boolean`

***

### canGoPreviousPeriod()

```ts
canGoPreviousPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:416](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L416)

#### Returns

`boolean`

***

### changeViewMode()

```ts
changeViewMode(newViewMode): void;
```

Defined in: [calendar/date-core.ts:267](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L267)

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

Defined in: [calendar/date-core.ts:133](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L133)

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

Defined in: [calendar/date-core.ts:141](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L141)

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

Defined in: [calendar/date-core.ts:137](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L137)

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

Defined in: [calendar/date-core.ts:164](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L164)

#### Returns

`PlainDate`[]

***

### getDaysNames()

```ts
getDaysNames(weekday): string[];
```

Defined in: [calendar/date-core.ts:256](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L256)

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

Defined in: [calendar/date-core.ts:145](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L145)

#### Returns

`PlainDate`

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:153](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L153)

#### Returns

`PlainDate`

***

### getWeekStartsOn()

```ts
getWeekStartsOn(): number;
```

Defined in: [calendar/date-core.ts:160](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L160)

#### Returns

`number`

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:377](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L377)

#### Returns

`void`

***

### goToNextPeriod()

```ts
goToNextPeriod(): void;
```

Defined in: [calendar/date-core.ts:329](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L329)

#### Returns

`void`

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod(): void;
```

Defined in: [calendar/date-core.ts:281](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L281)

#### Returns

`void`

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod(date): void;
```

Defined in: [calendar/date-core.ts:395](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L395)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`void`
