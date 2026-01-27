---
id: DateCoreOptions
title: DateCoreOptions
---

# Interface: DateCoreOptions

Defined in: [calendar/date-core.ts:51](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L51)

Base options interface for date-related core classes.

## Extended by

- [`CalendarCoreOptions`](CalendarCoreOptions.md)

## Properties

### calendar?

```ts
optional calendar: CalendarLike;
```

Defined in: [calendar/date-core.ts:59](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L59)

Optional calendar system to be used.

***

### dateFormatter?

```ts
optional dateFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:63](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L63)

Optional date formatter.

***

### dateTimeFormatter?

```ts
optional dateTimeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:67](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L67)

Optional date time formatter.

***

### locale?

```ts
optional locale: string;
```

Defined in: [calendar/date-core.ts:55](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L55)

Optional locale for date formatting. Uses a BCP 47 language tag.

***

### range?

```ts
optional range: DateRange;
```

Defined in: [calendar/date-core.ts:61](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L61)

Optional range of dates to be used.

***

### timeFormatter?

```ts
optional timeFormatter: DateTimeFormat;
```

Defined in: [calendar/date-core.ts:65](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L65)

Optional time formatter.

***

### timeZone?

```ts
optional timeZone: TimeZoneLike;
```

Defined in: [calendar/date-core.ts:57](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L57)

Optional time zone specification.

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/date-core.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L53)

The initial view mode configuration.
