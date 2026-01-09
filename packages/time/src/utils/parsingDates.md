# Parsing Dates

TanStack Time will include a basic parser for parsing dates and times. It will natively parse dates in the following formats:

- RFC3339 Internet Date/Time Format
- Unix Timestamp (Epoch Time)
- Existing Date object
- a "plain time" string

If taking an existing Date object, it will just copy it to a new object, as Date objects are mutable.

A Unix Timestamp (known as an Epoch) is the number of seconds that have elapsed since 00:00:00 Coordinated Universal Time (UTC), Thursday, 1 January 1970, not counting leap seconds. It is used widely in computer systems and is the standard way to represent a date and time in many programming languages. A Unix Timestamp already represents a specific point in time, so it is easily used to create a new Date object.

Parsing a date from a string is a bit more complex. The RFC3339 Internet Date/Time Format is a profile of the ISO 8601 standard for date and time formats. It is the most accurate way to represent a date and time, and it is the format that TanStack Time will use to parse dates from strings. It is also the format that TanStack Time will use to represent dates as strings.

## Date/Time Parts

The RFC3339 standard allows for the following date/time parts:

> [4 digit year[-2 digit month[-2 digit day]]][separator (t|T|" ")][2 digit hour[:2 digit minute[:2 digit second[.3 digit millisecond]]]][timezone/offset(z|Z|[(+|-)2 digit hour[:2 digit minute]])]

In accordance with the standard, if 'T' is used as a separator it may be in upper or lower case. If 'Z' is used as a timezone/offset, it may be in upper or lower case. The 'Z' timezone/offset is often referred to as 'Zulu' time, and represents UTC.

## Deviating From the RFC3339 Standard, and Why

For developers utilizing a fully qualified RFC3339 Internet Date/Time Format string, including timezone or offset, the parser will parse the string according to standard. However there are some caveats to the standard that the parser should correct.

There are irregularities in the way a date instance is created from an RFC3339 string, compared to what most developers believe the string to represent. For example, look at the following example:

```javascript
const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
  timeZoneName: 'short',
})
const dateString = '2024-12-14'
const date = new Date(dateString)
// a browser in the Eastern Time Zone will return:
// Fri Dec 13 2024 19:00:00 GMT-0500 (Eastern Standard Time)
formatter.format(date)
// "12/13/2024, 7:00:00 PM EST"
const dateString2 = '2024-12-14T00:00:00'
const date2 = new Date(dateString2)
// a browser in the Eastern Time Zone will return:
// Sat Dec 14 2024 00:00:00 GMT-0500 (Eastern Standard Time)
formatter.format(date2)
// "12/14/2024, 12:00:00 AM EST"
```

The valid RFC3339 string of `2024-12-14` is meant to represent "December 14, 2024", however according to the standard all parts are relative to UTC date/time, and later interpreted to the browser local timezone. A developer would consider this to be the beginning of the day, for the timezone of the user, since no time or timezone/offset is specified. However, the Date object will interpret this as "December 13, 2024" at 7:00 PM, for a browser in the Eastern Time Zone. This is because the Date object will interpret the string as a UTC date, and then convert it to the local time zone. This is a major area of confusion for developers, and not the behavior that a developer would expect, and the behavior that the parser should correct.

A parser should parse an RFC3339 string according to what date parts have been supplied. A valid RFC3339 string considers all date parts to be optional (aside from year), and the parser should interpret the string as such. If a date part is not supplied, the parser should assume the beginning for that part. If a time part is not supplied, the parser should assume the beginning of the day. If a timezone/offset part is not supplied, the parser should assume the local time zone. This is the behavior that the parser will implement.

There are some caveats:

- If a day is supplied, month and year are required.
- If a month is supplied, year is required.
- If a time is supplied, a full date (day, month and year) is required.
- If milliseconds are supplied, seconds, minutes and hours are required.
- If seconds are supplied, minutes and hours are required.
- If minutes are supplied, hours are required.

The RFC3339 standard does not allow for the inclusion of timezone/offset without a time part. However, the parser will allow for that, and assume the beginning of the day, and the given time zone. In this scenario, the timezone/offset must be preceded by the date/time separator.

## Dealing With Only "Time"

The Date object does not have facility for "only a time", without a date. However, the parser will allow for a "plain time" string in the format `HH:MM:SS.SSS` (hours, minutes, seconds, milliseconds). The parser will create a Date with the current 'date' of the browser, and the given time. The timezone/offset will always be assumed to be the local time zone.

This allows for using the Intl.DateTimeFormat to format the time, and the parser to parse the time, without having to worry about the date.

This also allows for the internal creation of Temporal.PlainTime objects, which will be used in the future for time only manipulation.

## Parser output

The parser is used internal to TanStack Time, to interpret the given input for future manipulation and output. While the parser will be publicly available from the API, it is not intended to be used as a general purpose date parser. The public API is available for the creation of other parsers. It is intended to be used to parse dates in the formats that TanStack Time will use to manipulate dates and times.

All other public API methods will typically return RFC3339 strings representing a date/time instance (UTC), or formatted representations of the date/time instance, according to the formatter configuration.
