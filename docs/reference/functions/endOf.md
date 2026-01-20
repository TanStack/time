---
id: endOf
title: endOf
---

# Function: endOf()

```ts
function endOf(input, options): object;
```

Defined in: [endOf/endOf.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/date/endOf/endOf.ts#L23)

endOf
Returns the end of a given unit for a date/time instance

## Parameters

### input

`DateInput`

### options

[`EndOfOptions`](../interfaces/EndOfOptions.md)

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
