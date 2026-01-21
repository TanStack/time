---
id: add
title: add
---

# Function: add()

```ts
function add(input, options): object;
```

Defined in: [add/add.ts:13](https://github.com/TanStack/time/blob/main/packages/time/src/date/add/add.ts#L13)

add
Adds a duration to a date/time instance

## Parameters

### input

[`DateInput`](../type-aliases/DateInput.md)

### options

[`AddOptions`](../interfaces/AddOptions.md)

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
