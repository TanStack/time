---
id: set
title: set
---

# Function: set()

```ts
function set(input, options): object;
```

Defined in: [date/set/set.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/date/set/set.ts#L21)

## Parameters

### input

[`DateInput`](../type-aliases/DateInput.md)

### options

[`SetOptions`](../interfaces/SetOptions.md)

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
