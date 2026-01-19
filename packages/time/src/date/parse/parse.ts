/**
 * rfc3339DateTimeOptionalTimeRegex
 * Regular expression to match RFC3339 date/time strings with all optional parts
 */
const rfc3339DateTimeOptionalTimeRegex =
  /^(?<fulldate>(?<year>\d{4})(?:-(?<month>0[1-9]|1[0-2])(?:-(?<day>0[1-9]|[12][0-9]|3[01]))))(?:(?:T| )(?<fulltime>(?<hour>[01][0-9]|2[0-3])(?::(?<minute>[0-5][0-9])(?::(?<second>[0-5][0-9])(?:\.(?<millisecond>\d+))?)?)?)?(?<timezone>Z|[+-](?:2[0-3]|[01][0-9]:[0-5][0-9]))?)?$/i

/**
 * timeOnlyRegex
 * Regular expression to match time-only strings
 */
const timeOnlyRegex =
  /^((?<hour>(?:2[0-3]|[0-1][0-9]))(?::(?<minute>[0-5][0-9])(?::(?<second>[0-5][0-9])(?:\.(?<millisecond>\d+))?)?)?)(?:\s(?<meridiem>(?:AM|PM)))?$/i

/**
 * dateOnlyRegex
 * Regular expression to match date-only strings
 */
const dateOnlyRegex =
  /^(?<year>\d{4})(-(?<month>0[1-9]|1[0-2]))?(-(?<day>0[1-9]|[12][0-9]|3[01]))?(?<separator>T| )?(?<timezone>Z|[+-](?:2[0-3]|[01][0-9]:[0-5][0-9]))?$/i

/**
 * isValidEpoch
 * Verifies if a numeric value is a valid epoch date
 * @param {number} value
 * @returns boolean
 */
function isValidEpoch(value: number): boolean {
  return value >= -8.64e12 && value <= +8.64e12
}

/**
 * parseEpochDateTime
 * Parses a numeric value as a date/time epoch
 * @param {number} value
 * @returns Date
 */
function parseEpochDateTime(value: number): Date {
  // if it's a floating point number, assume it's a unix timestamp
  const toParse = Number.isInteger(value) ? value : value * 1000
  // but verify
  if (isValidEpoch(toParse)) {
    return new Date(toParse)
  }
  throw new Error(`"${value}" is an invalid epoch date value`)
}

/**
 * parseDateTimeString
 * Parses a string as a date/time string
 * @param {string} value
 * @returns Date
 */
function parseDateTimeString(value: string): Date {
  const match =
    rfc3339DateTimeOptionalTimeRegex.exec(value) ?? dateOnlyRegex.exec(value)

  if (match?.groups) {
    const {
      year,
      month = '01',
      day = '01',
      hour = '00',
      minute = '00',
      second = '00',
      millisecond = '000',
      timezone = '',
    } = match.groups

    // If timezone is specified, use ISO string format (will be parsed as UTC/offset)
    if (timezone) {
      const millisecondStr = millisecond || '000'
      return new Date(
        `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecondStr.padEnd(3, '0').substring(0, 3)}${timezone}`,
      )
    }

    // For dates without timezone, use Date constructor with individual components
    // This creates a date in the system's local timezone
    const millisecondStr = (millisecond || '000').padEnd(3, '0').substring(0, 3)
    return new Date(
      Number(year),
      Number(month) - 1, // Month is 0-indexed
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(millisecondStr),
    )
  }
  throw new Error(`"${value}" is an invalid RFC339 Internet Date Time string`)
}

/**
 * parseTimeOnlyString
 * Parses a string as a time-only string
 * @param {string} value
 * @returns Date
 */
function parseTimeOnlyString(value: string): Date {
  const match = timeOnlyRegex.exec(value)
  if (match?.groups) {
    const now = new Date()
    const {
      hour = '00',
      minute = '00',
      second = '00',
      millisecond = '000',
      meridiem,
    } = match.groups
    // convert 12 hour time to 24
    let trueHour = Number(hour)
    if (meridiem) {
      if (trueHour > 12 || trueHour === 0) {
        throw new Error(`"${value}" is an invalid time string`)
      }
      if (meridiem.toLowerCase() === 'pm') {
        if (trueHour < 12) {
          trueHour += 12
        }
        // If hour is 12 PM, keep it as 12 (noon)
      } else {
        // AM
        if (trueHour === 12) {
          trueHour = 0 // 12 AM is midnight
        }
      }
    }
    // If no meridiem, assume 24-hour format (hour can be 00-23)
    const millisecondStr = (millisecond || '000').padEnd(3, '0').substring(0, 3)
    now.setHours(
      trueHour,
      Number(minute),
      Number(second),
      Number(millisecondStr),
    )
    return now
  }
  throw new Error(`"${value}" is an invalid time string`)
}

/**
 * parseDateOrTimeString
 * Parses a string as a date/time or time string
 * @param {string} value
 * @returns Date
 */
function parseDateOrTimeString(value: string): Date {
  const match = timeOnlyRegex.exec(value)
  if (match) {
    return parseTimeOnlyString(value)
  }
  return parseDateTimeString(value)
}

/**
 * parse
 * Parses a string, number or Date object as a Date
 * @param {string | number | Date} value
 * @returns Date | undefined
 */
export function parse(value: string | number | Date): Date | undefined {
  if (!value) return undefined
  if (typeof value === 'string') {
    return parseDateOrTimeString(value)
  } else if (typeof value === 'number') {
    return parseEpochDateTime(value)
  }
  return value
}
