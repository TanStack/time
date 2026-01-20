---
id: round
title: round
---

# Function: round()

```ts
function round(input, options): object;
```

Defined in: [round/round.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/date/round/round.ts#L25)

round
Returns the date/time instance rounded to the nearest unit

## Parameters

### input

`DateInput`

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
