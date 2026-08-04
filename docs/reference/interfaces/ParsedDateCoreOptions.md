---
id: ParsedDateCoreOptions
title: ParsedDateCoreOptions
---

# Interface: ParsedDateCoreOptions

Defined in: [calendar/date-core.ts:75](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L75)

## Extends

- `Omit`\<`Required`\<[`DateCoreOptions`](DateCoreOptions.md)\>, `"range"` \| `"dateFormatter"` \| `"timeFormatter"` \| `"dateTimeFormatter"`\>

## Properties

### calendar

```ts
calendar: CalendarLike;
```

Defined in: [calendar/date-core.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L64)

Optional calendar system to be used.

#### Inherited from

[`CalendarCoreOptions`](CalendarCoreOptions.md).[`calendar`](CalendarCoreOptions.md#calendar)

***

### locale

```ts
locale: string;
```

Defined in: [calendar/date-core.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L60)

Optional locale for date formatting. Uses a BCP 47 language tag.

#### Inherited from

[`CalendarCoreOptions`](CalendarCoreOptions.md).[`locale`](CalendarCoreOptions.md#locale)

***

### range

```ts
range: ParsedDateRange;
```

Defined in: [calendar/date-core.ts:80](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L80)

***

### timeZone

```ts
timeZone: TimeZoneLike;
```

Defined in: [calendar/date-core.ts:62](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L62)

Optional time zone specification.

#### Inherited from

[`CalendarCoreOptions`](CalendarCoreOptions.md).[`timeZone`](CalendarCoreOptions.md#timezone)

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/date-core.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L58)

The initial view mode configuration.

#### Inherited from

[`CalendarCoreOptions`](CalendarCoreOptions.md).[`viewMode`](CalendarCoreOptions.md#viewmode)
