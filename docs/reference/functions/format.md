---
id: format
title: format
---

# Function: format()

```ts
function format(date, formatOptions?): string;
```

Defined in: [date/format/format.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/date/format/format.ts#L32)

format
Formats a date/time instance using Intl.DateTimeFormat

## Parameters

### date

[`DateInput`](../type-aliases/DateInput.md)

The date to format

### formatOptions?

[`FormatDateOptions`](../interfaces/FormatDateOptions.md)

Formatting options including type, locale, and Intl.DateTimeFormat options

## Returns

`string`
