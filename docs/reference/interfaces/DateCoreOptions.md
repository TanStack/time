---
id: DateCoreOptions
title: DateCoreOptions
---

# Interface: DateCoreOptions

Defined in: [calendar/date-core.ts:56](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L56)

Base options interface for date-related core classes.

## Extended by

- [`CalendarCoreOptions`](CalendarCoreOptions.md)

## Properties

### calendar?

```ts
optional calendar: CalendarLike;
```

Defined in: [calendar/date-core.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L64)

Optional calendar system to be used.

***

### dateFormatter?

```ts
optional dateFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L68)

Optional date formatter.

***

### dateTimeFormatter?

```ts
optional dateTimeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:72](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L72)

Optional date time formatter.

***

### locale?

```ts
optional locale: string;
```

Defined in: [calendar/date-core.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L60)

Optional locale for date formatting. Uses a BCP 47 language tag.

***

### range?

```ts
optional range: DateRange;
```

Defined in: [calendar/date-core.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L66)

Optional range of dates to be used.

***

### timeFormatter?

```ts
optional timeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:70](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L70)

Optional time formatter.

***

### timeZone?

```ts
optional timeZone: TimeZoneLike;
```

Defined in: [calendar/date-core.ts:62](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L62)

Optional time zone specification.

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/date-core.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L58)

The initial view mode configuration.
