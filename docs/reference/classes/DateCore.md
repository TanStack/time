---
id: DateCore
title: DateCore
---

# Abstract Class: DateCore

Defined in: [calendar/date-core.ts:77](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L77)

## Extended by

- [`CalendarCore`](CalendarCore.md)

## Constructors

### Constructor

```ts
new DateCore(options): DateCore;
```

Defined in: [calendar/date-core.ts:86](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L86)

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

Defined in: [calendar/date-core.ts:80](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L80)

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

Defined in: [calendar/date-core.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L79)

***

### store

```ts
store: Store<CalendarStore>;
```

Defined in: [calendar/date-core.ts:78](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L78)

## Methods

### canGoNextPeriod()

```ts
canGoNextPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:407](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L407)

#### Returns

`boolean`

***

### canGoPreviousPeriod()

```ts
canGoPreviousPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:376](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L376)

#### Returns

`boolean`

***

### changeViewMode()

```ts
changeViewMode(newViewMode): void;
```

Defined in: [calendar/date-core.ts:254](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L254)

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

Defined in: [calendar/date-core.ts:130](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L130)

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

Defined in: [calendar/date-core.ts:138](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L138)

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

Defined in: [calendar/date-core.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L134)

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

Defined in: [calendar/date-core.ts:161](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L161)

#### Returns

`PlainDate`[]

***

### getDaysNames()

```ts
getDaysNames(weekday): string[];
```

Defined in: [calendar/date-core.ts:243](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L243)

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

Defined in: [calendar/date-core.ts:142](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L142)

#### Returns

`PlainDate`

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:150](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L150)

#### Returns

`PlainDate`

***

### getWeekStartsOn()

```ts
getWeekStartsOn(): number;
```

Defined in: [calendar/date-core.ts:157](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L157)

#### Returns

`number`

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:347](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L347)

#### Returns

`void`

***

### goToNextPeriod()

```ts
goToNextPeriod(): void;
```

Defined in: [calendar/date-core.ts:304](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L304)

#### Returns

`void`

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod(): void;
```

Defined in: [calendar/date-core.ts:261](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L261)

#### Returns

`void`

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod(date): void;
```

Defined in: [calendar/date-core.ts:360](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L360)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`void`
