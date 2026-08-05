---
id: endOf
title: endOf
---

# Function: endOf()

```ts
function endOf(input, options): object;
```

Defined in: [date/endOf/endOf.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/date/endOf/endOf.ts#L19)

## Parameters

### input

[`DateInput`](../type-aliases/DateInput.md)

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
