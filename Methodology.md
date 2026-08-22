## Some Givens

As mentioned in our initial wiki entry, we have a few givens that we are working with:

- Dates, given to the TanStack Time API, should be in standard Internet Date Time Format [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) (string) format, epoch time (numeric), or already be a Date object.
- Format of dates/times are configurable to base standards set forth by the Intl.DateTimeFormat API. Formats are not designated by string tokens, but rather by parts, and displayed according to locale, calendar and timezone. This ensures consistent display of dates and times when switching between any of these three localization points.
- Until Temporal is ratified and implemented by all major browsers, TanStack Time will [use the polyfill](https://github.com/js-temporal/temporal-polyfill) maintained by the TC39 champions of the Temporal API
- Date objects are mutable, therefore we must take care not to directly revise any Date passed into the API
- Public API methods should return either a Date object or a string. Temporal objects should never be returned by the public API methods.

## Assumptions of working with true date and time

Developers, dealing with accurate references to an instance of date/time, require a few things:

- A reference to the date/time instance, either as an RFC 3339 string or epoch time
- The timezone of the date/time instance
- And, in some instances, the calendar system of the date/time instance

Why is this important? Because a date/time instance is not a static point in time. It is a reference to a point in time that is relative to the timezone and calendar system in which it is being referenced. This is why it is important to know the timezone and calendar system of the date/time instance. This is the reason the Temporal API is so important. It allows us to work with date/time instances in a way that is more accurate with how we truly interoperate with date/time instances.

## Defaults

We can get the browser local defaults for the timezone and calendar system by using the Intl.DateTimeFormat API. This will allow us to set defaults for the timezone and calendar system when the developer does not provide them. That said, we should always allow the developer to override these defaults on a case by case basis.

## Rethinking In Terms of DX

When we think about the DX of the TanStack Time API, we need to consider the following:

- Developers will often be working with date and time values stored in a database
- Developers will often be working with date and time values from user input
- Those values will need to be converted to valid ZonedDateTime objects internally
  - This will require the developer to know the timezone of the date/time instance
  - This will require the developer to know the calendar system of the date/time instance
- Developers will need to be able to define the representation (return type) of the return value of a method (this excludes formatting methods)
  - Do they need an RFC 3339 string? 'standard' (current zulu time standard) or 'long' (with timezone and calendar)?
  - Do they need an epoch time?
  - Do they need a Date object?
  - Do they need a ZonedDateTime object? (this would be for calling multiple methods back to back to back)

Because the user may use the browser defaults for the timezone and calendar system, it may be necessary to return these options with the 'result' of a method call. This will allow the developer to know what the defaults were when the method was called, where they may need to database the timeZone or calendar.

```js
// maybe?
const { value: firstOfMonth, options } = startOf({
  date: '2024-03-05T12:34:56.789Z',
  unit: 'month',
  returnFormat: 'ZonedDateTime',
  // These 'options' would be the defaults set by the Intl.DateTimeFormat API
  // and could be overridden by the developer
  /* options: {
    calendar: 'gregory',
    timeZone: 'America/New_York'
  } */
})
const { value: firstCalendarDayOfMarch } = startOf({
  date: firstOfMonth, // as a ZonedDateTime object it won't have to be parsed
  unit: 'week',
  returnFormat: 'standard', // an ISO 8601 string to send to the database
  options, // uses returned options from first method to maintain consistency
})
// maybe?
const myDate = startOf({ ...options })
const value = myDate.asDate()
const value2 = myDate.asEpoch()
const tz = myDate.timeZone
const { value, timeZone, calendar } = myDate
```

As mentioned in the Temporal documentation, the ISO 8601 and RFC 3339 industry standards for machine-readable serialization of dates and times are considering extension to include the timeZone and calendar as a part of the string. This would allow for a more complete representation of the date/time instance. This is something we should consider when returning a string representation of a date/time instance. (i.e. `2024-03-05T12:34:56.789Z[America/New_York][u-ca=gregory]`). While this may be acceptable for string based representations, where later access to timeZone and calendar may be required.

## Possible Workflow

### Workflow 'A'

One possible way of handling this is for each method to be standalone, requiring basic arguments
and options and returning a result and options. This would allow for a more flexible API, but
may require more boilerplate code to be written by the developer.

1. Method takes in a date/time value, arguments, and options
   a. If value is already a ZonedDateTime, continue
   b. If not a ZonedDateTime (i.e. string, epoch time, or Date object), convert to ZonedDateTime
2. Method processes the ZonedDateTime
3. Method returns the result and options
   a. Result is in default or specified returnFormat
   b. Options include timeZone and calendar

### Workflow 'B'

Another possible way of handling this is by utilizing a class that can be instantiated with the options and returnFormat. The class would then hold the 'value' internally, and the return of any method (aside from the `value` getter) would return the class instance, allowing one to chain methods together.

I'm not sure what this looks like yet, but honestly not a fan. From a DX perspective it gives an initial appearance of ease of use, but seems like in the end it would be more difficult to work with, too difficult to see your progression in the process stack, and hard to identify error boundaries. It would also require a rather large object with a lot of methods, creating a lot of object overhead for simple processes, and make it difficult to treeshake.

```js
// maybe?
const firstCalendarDayOfMarch = new TanStackTime('2024-03-05T12:34:56.789Z', {
  timeZone: 'America/New_York',
  calendar: 'gregory',
  returnFormat: 'standard',
})
  .startOf({ unit: 'month' })
  .startOf({ unit: 'week' })
  .asDate()
```

## Parsing

When parsing input date/time values, we need to consider the following:

- If the input is numeric (epoch time), we need to convert it to a valid ZonedDateTime object
- If the input is a string, we need to convert it to a valid ZonedDateTime object?
- If the input is a Date object, we need to convert it to a valid ZonedDateTime object

### Epoch parsing

An epoch time is a numeric value that represents the number of milliseconds since the Unix epoch (1970-01-01T00:00:00.000Z). This is a common way of representing a date/time instance in a database. All we require, aside from it's value, is the timezone and calendar system in which it is being referenced.

```js
const timeZone = 'Asia/Tokyo'
const calendar = 'japanese'
const legacy = new Date(1726515625477)
const zdt = Temporal.ZonedDateTime.from(`${legacy.toJSON()}[${timeZone}][u-ca=${calendar}]`)
```

### String parsing

A string representation must be in the RFC 3339 standard format, or in the ISO 8601 extended format. This is the most common way of representing a date/time instance in a web application. All we require, aside from it's value, is the timezone and calendar system in which it is being referenced.

```js
const timeZone = 'Asia/Tokyo'
const calendar = 'japanese'
const legacy = '2024-03-05T12:34:56.789Z'
const zdt = Temporal.ZonedDateTime.from(`${legacy}[${timeZone}][u-ca=${calendar}]`)
```

This assumes that the timeZone and calendar are not already included in the string. If they are, we can simply pass the string to the Temporal.ZonedDateTime.from() method.

### Date parsing

A Date object is a native object in JavaScript that represents a date/time instance. This is a common way of representing a date/time instance in a web application. All we require, aside from it's value, is the timezone and calendar system in which it is being referenced.

```js
const timeZone = 'Asia/Tokyo'
const calendar = 'japanese'
const legacy = new Date() // this would be passed into a method, but this is just an example
const zdt = Temporal.ZonedDateTime.from(`${legacy.toJSON()}[${timeZone}][u-ca=${calendar}]`)
```
