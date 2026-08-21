---
id: min
title: min
---

# Function: min()

```ts
function min(dates, options?): object;
```

Defined in: [date/min/min.ts:9](https://github.com/TanStack/time/blob/main/packages/time/src/date/min/min.ts#L9)

## Parameters

### dates

[`DateInput`](../type-aliases/DateInput.md)[]

### options?

[`MinOptions`](../interfaces/MinOptions.md)

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
