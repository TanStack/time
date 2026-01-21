---
id: round
title: round
---

# Function: round()

```ts
function round(input, options): object;
```

Defined in: [round/round.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/date/round/round.ts#L27)

round
Returns the date/time instance rounded to the nearest unit

## Parameters

### input

[`DateInput`](../type-aliases/DateInput.md)

### options

[`RoundOptions`](../interfaces/RoundOptions.md)

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
