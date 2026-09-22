---
id: fromUnixTime
title: fromUnixTime
---

# Function: fromUnixTime()

```ts
function fromUnixTime(timestamp, options?): object;
```

Defined in: [date/fromUnixTime/fromUnixTime.ts:8](https://github.com/TanStack/time/blob/main/packages/time/src/date/fromUnixTime/fromUnixTime.ts#L8)

## Parameters

### timestamp

`number`

### options?

[`FromUnixTimeOptions`](../interfaces/FromUnixTimeOptions.md)

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
