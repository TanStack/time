const rfc3339DateTimeOptionalTimeRegex =
  /^(?<fulldate>(?<year>\d{4})(?:-(?<month>0[1-9]|1[0-2])(?:-(?<day>0[1-9]|[12][0-9]|3[01]))))(?:(?:T| )(?<fulltime>(?<hour>[01][0-9]|2[0-3])(?::(?<minute>[0-5][0-9])(?::(?<second>[0-5][0-9])(?:\.(?<millisecond>\d+))?)?)?)?(?<timezone>Z|[+-](?:2[0-3]|[01][0-9]:[0-5][0-9]))?)?$/i

const timeOnlyRegex =
  /^((?<hour>(?:2[0-3]|[0-1][0-9]))(?::(?<minute>[0-5][0-9])(?::(?<second>[0-5][0-9])(?:\.(?<millisecond>\d+))?)?)?)(?:\s(?<meridiem>(?:AM|PM)))?$/i

const dateOnlyRegex =
  /^(?<year>\d{4})(-(?<month>0[1-9]|1[0-2]))?(-(?<day>0[1-9]|[12][0-9]|3[01]))?(?<separator>T| )?(?<timezone>Z|[+-](?:2[0-3]|[01][0-9]:[0-5][0-9]))?$/i

function isValidEpoch(value: number): boolean {
  return value >= -8.64e12 && value <= +8.64e12
}

function parseEpochDateTime(value: number): Date {
  const toParse = Number.isInteger(value) ? value : value * 1000

  if (isValidEpoch(toParse)) {
    return new Date(toParse)
  }
  throw new Error(`"${value}" is an invalid epoch date value`)
}

function parseDateTimeString(value: string): Date {
  const match = rfc3339DateTimeOptionalTimeRegex.exec(value) ?? dateOnlyRegex.exec(value)

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

    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}${timezone}`)
  }
  throw new Error(`"${value}" is an invalid RFC339 Internet Date Time string`)
}

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

    let trueHour = Number(hour)
    if (meridiem) {
      if (trueHour > 12) {
        throw new Error(`"${value}" is an invalid time string`)
      }
      if (meridiem.toLowerCase() === 'pm' && trueHour < 12) {
        trueHour += 12
      }
    }
    now.setHours(trueHour, Number(minute), Number(second), Number(millisecond))
    return now
  }
  throw new Error(`"${value}" is an invalid time string`)
}

function parseDateOrTimeString(value: string): Date {
  const match = timeOnlyRegex.exec(value)
  if (match) {
    return parseTimeOnlyString(value)
  }
  return parseDateTimeString(value)
}

export function parse(value: string | number | Date): Date | undefined {
  if (!value) return undefined
  if (typeof value === 'string') {
    return parseDateOrTimeString(value)
  } else if (typeof value === 'number') {
    return parseEpochDateTime(value)
  }
  return value
}

interface DateParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const pad = (n: number): string => String(n).padStart(2, '0')

function extractDateParts(value: string | Date | number): DateParts {
  if (value instanceof Date) {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
      hour: value.getHours(),
      minute: value.getMinutes(),
      second: value.getSeconds(),
    }
  }

  if (typeof value === 'number') {
    return extractDateParts(parseEpochDateTime(value))
  }

  const match = rfc3339DateTimeOptionalTimeRegex.exec(value) ?? dateOnlyRegex.exec(value)

  if (!match?.groups) {
    throw new Error(
      `"${value}" is not a valid date/time string. Expected formats: YYYY-MM-DD, YYYY-MM-DDTHH:mm, or YYYY-MM-DDTHH:mm:ss`,
    )
  }

  return {
    year: Number(match.groups.year),
    month: Number(match.groups.month ?? '01'),
    day: Number(match.groups.day ?? '01'),
    hour: Number(match.groups.hour ?? '00'),
    minute: Number(match.groups.minute ?? '00'),
    second: Number(match.groups.second ?? '00'),
  }
}

export function toPlainDateTimeString(value: string | Date | number): string {
  const { year, month, day, hour, minute, second } = extractDateParts(value)
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`
}

export function toPlainDateString(value: string | Date | number): string {
  const { year, month, day } = extractDateParts(value)
  return `${year}-${pad(month)}-${pad(day)}`
}

export function toPlainTimeString(value: string | Date | number): string {
  const { hour, minute } = extractDateParts(value)
  return `${pad(hour)}:${pad(minute)}`
}

export function toDate(value: string | Date | number): Date {
  const { year, month, day } = extractDateParts(value)
  return new Date(year, month - 1, day)
}
