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

### asLong()

```ts
asLong: () => string;
```

#### Returns

`string`

### asString()

```ts
asString: () => string;
```

#### Returns

`string`

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
options: Required<DateOptions>;
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
