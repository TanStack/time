---
id: max
title: max
---

# Function: max()

```ts
function max(dates, options?): object;
```

Defined in: [date/max/max.ts:9](https://github.com/TanStack/time/blob/main/packages/time/src/date/max/max.ts#L9)

## Parameters

### dates

[`DateInput`](../type-aliases/DateInput.md)[]

### options?

[`MaxOptions`](../interfaces/MaxOptions.md)

## Returns

`object`

### asDate()

```ts
asDate: () => Date;
```

#### Returns

`Date`

### asEpoch()

```ts
asEpoch: () => number;
```

#### Returns

`number`

### asZonedDateTime()

```ts
asZonedDateTime: () => ZonedDateTime;
```

#### Returns

`ZonedDateTime`

### calendar

```ts
calendar: string = options.calendar;
```

### options

```ts
options: ResolvedDateOperationOptions;
```

### returnFormat

```ts
returnFormat: ReturnFormat;
```

### timeZone

```ts
timeZone: string = options.timeZone;
```

### value

```ts
value: string;
```
