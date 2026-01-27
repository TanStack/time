---
id: ParsedDateCoreOptions
title: ParsedDateCoreOptions
---

# Interface: ParsedDateCoreOptions

Defined in: [calendar/date-core.ts:70](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L70)

## Extends

- `Omit`\<`Required`\<[`DateCoreOptions`](DateCoreOptions.md)\>, `"range"` \| `"dateFormatter"` \| `"timeFormatter"` \| `"dateTimeFormatter"`\>

## Properties

### calendar

```ts
calendar: CalendarLike;
```

Defined in: [calendar/date-core.ts:59](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L59)

Optional calendar system to be used.

#### Inherited from

[`CalendarCoreOptions`](CalendarCoreOptions.md).[`calendar`](CalendarCoreOptions.md#calendar)

***

### locale

```ts
locale: string;
```

Defined in: [calendar/date-core.ts:55](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L55)

Optional locale for date formatting. Uses a BCP 47 language tag.

#### Inherited from

[`CalendarCoreOptions`](CalendarCoreOptions.md).[`locale`](CalendarCoreOptions.md#locale)

***

### range

```ts
range: ParsedDateRange;
```

Defined in: [calendar/date-core.ts:74](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L74)

***

### timeZone

```ts
timeZone: TimeZoneLike;
```

Defined in: [calendar/date-core.ts:57](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L57)

Optional time zone specification.

#### Inherited from

[`CalendarCoreOptions`](CalendarCoreOptions.md).[`timeZone`](CalendarCoreOptions.md#timezone)

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/date-core.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L53)

The initial view mode configuration.

#### Inherited from

[`CalendarCoreOptions`](CalendarCoreOptions.md).[`viewMode`](CalendarCoreOptions.md#viewmode)
