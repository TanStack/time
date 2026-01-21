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

[`DateInput`](../type-aliases/DateInput.md)

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
