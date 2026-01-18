import './setupTemporal'
import { Temporal } from '@js-temporal/polyfill'
import { getDefaultCalendar, getDefaultTimeZone } from './dateDefaults'
import { validateDate } from './validateDate'

export interface ToZonedDateTimeOptions {
  timeZone?: string
  calendar?: string
}

/**
 * Checks if a value is already a Temporal.ZonedDateTime
 */
function isZonedDateTime(
  value: unknown,
): value is Temporal.ZonedDateTime {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('timeZone' in value) ||
    !('calendar' in value)
  ) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.timeZone === 'string' &&
    typeof candidate.calendar === 'string'
  )
}

/**
 * Converts a date input (string, number, Date, or ZonedDateTime) to a Temporal.ZonedDateTime
 * @param date - The date input (RFC 3339 string, epoch number, Date object, or ZonedDateTime)
 * @param options - Options containing timeZone and calendar
 * @returns Temporal.ZonedDateTime
 */
export function toZonedDateTime(
  date: string | number | Date | Temporal.ZonedDateTime,
  options: ToZonedDateTimeOptions = {},
): Temporal.ZonedDateTime {
  const timeZone = options.timeZone ?? getDefaultTimeZone()
  const calendar = options.calendar ?? getDefaultCalendar()

  // If already a ZonedDateTime, return as-is
  if (isZonedDateTime(date)) {
    return date
  }

  let dateString: string

  if (typeof date === 'string') {
    // Check if string already includes timezone and calendar
    if (date.includes('[') && date.includes(']')) {
      // String already has timezone/calendar info, parse directly
      return Temporal.ZonedDateTime.from(date)
    }
    // Validate and parse the string
    const parsedDate = validateDate({
      date,
      errorMessage: `Invalid date string: "${date}"`,
    })
    dateString = parsedDate.toISOString()
  } else if (typeof date === 'number') {
    // Epoch time - convert to Date first, then to ISO string
    const parsedDate = validateDate({
      date,
      errorMessage: `Invalid epoch time: "${date}"`,
    })
    dateString = parsedDate.toISOString()
  } else if (date instanceof Date) {
    // Date object - convert to ISO string
    dateString = date.toISOString()
  } else {
    throw new Error(`Invalid date input type: ${typeof date}`)
  }

  // Convert to ZonedDateTime with timezone and calendar
  return Temporal.ZonedDateTime.from(
    `${dateString}[${timeZone}][u-ca=${calendar}]`,
  )
}
