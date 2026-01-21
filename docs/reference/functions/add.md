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
