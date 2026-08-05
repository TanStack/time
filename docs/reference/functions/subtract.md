---
id: subtract
title: subtract
---

# Function: subtract()

```ts
function subtract(input, options): object;
```

Defined in: [date/subtract/subtract.ts:9](https://github.com/TanStack/time/blob/main/packages/time/src/date/subtract/subtract.ts#L9)

## Parameters

### input

[`DateInput`](../type-aliases/DateInput.md)

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
