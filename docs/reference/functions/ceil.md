---
id: ceil
title: ceil
---

# Function: ceil()

```ts
function ceil(input, options): object;
```

Defined in: [date/ceil/ceil.ts:18](https://github.com/TanStack/time/blob/main/packages/time/src/date/ceil/ceil.ts#L18)

## Parameters

### input

[`DateInput`](../type-aliases/DateInput.md)

### options

[`CeilOptions`](../interfaces/CeilOptions.md)

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
