---
id: startOf
title: startOf
---

# Function: startOf()

```ts
function startOf(input, options): object;
```

Defined in: [startOf/startOf.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/date/startOf/startOf.ts#L23)

startOf
Returns the start of a given unit for a date/time instance

## Parameters

### input

`DateInput`

### options

[`StartOfOptions`](../interfaces/StartOfOptions.md)

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
