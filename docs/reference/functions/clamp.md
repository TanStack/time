---
id: clamp
title: clamp
---

# Function: clamp()

```ts
function clamp(input, options): object;
```

Defined in: [date/clamp/clamp.ts:13](https://github.com/TanStack/time/blob/main/packages/time/src/date/clamp/clamp.ts#L13)

## Parameters

### input

[`DateInput`](../type-aliases/DateInput.md)

### options

[`ClampOptions`](../interfaces/ClampOptions.md)

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
