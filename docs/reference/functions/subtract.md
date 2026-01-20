---
id: subtract
title: subtract
---

# Function: subtract()

```ts
function subtract(input, options): object;
```

Defined in: [subtract/subtract.ts:13](https://github.com/TanStack/time/blob/main/packages/time/src/date/subtract/subtract.ts#L13)

subtract
Subtracts a duration from a date/time instance

## Parameters

### input

`DateInput`

### options

[`SubtractOptions`](../interfaces/SubtractOptions.md)

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
calendar: string | undefined = options.calendar;
```

### options

```ts
options: DateOperationOptions;
```

### returnFormat

```ts
returnFormat: ReturnFormat | undefined;
```

### timeZone

```ts
timeZone: string | undefined = options.timeZone;
```

### value

```ts
value: string;
```
