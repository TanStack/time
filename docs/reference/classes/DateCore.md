---
id: DateCore
title: DateCore
---

# Abstract Class: DateCore

Defined in: [calendar/date-core.ts:78](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L78)

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

Defined in: [calendar/date-core.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L81)

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

Defined in: [calendar/date-core.ts:80](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L80)

***

### store

```ts
store: Store<CalendarStore>;
```

Defined in: [calendar/date-core.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L79)

## Methods

### canGoNextPeriod()

```ts
canGoNextPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:445](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L445)

#### Returns

`boolean`

***

### canGoPreviousPeriod()

```ts
canGoPreviousPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:414](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L414)

#### Returns

`boolean`

***

### changeViewMode()

```ts
changeViewMode(newViewMode): void;
```

Defined in: [calendar/date-core.ts:265](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L265)

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

Defined in: [calendar/date-core.ts:131](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L131)

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

Defined in: [calendar/date-core.ts:139](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L139)

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

Defined in: [calendar/date-core.ts:135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L135)

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

Defined in: [calendar/date-core.ts:162](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L162)

#### Returns

`PlainDate`[]

***

### getDaysNames()

```ts
getDaysNames(weekday): string[];
```

Defined in: [calendar/date-core.ts:254](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L254)

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

Defined in: [calendar/date-core.ts:143](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L143)

#### Returns

`PlainDate`

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:151](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L151)

#### Returns

`PlainDate`

***

### getWeekStartsOn()

```ts
getWeekStartsOn(): number;
```

Defined in: [calendar/date-core.ts:158](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L158)

#### Returns

`number`

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:375](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L375)

#### Returns

`void`

***

### goToNextPeriod()

```ts
goToNextPeriod(): void;
```

Defined in: [calendar/date-core.ts:327](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L327)

#### Returns

`void`

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod(): void;
```

Defined in: [calendar/date-core.ts:279](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L279)

#### Returns

`void`

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod(date): void;
```

Defined in: [calendar/date-core.ts:393](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L393)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`void`
