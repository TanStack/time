/**
 * isValidDate
 * Verifies if a date is a JS Date object and is valid
 * @param date Date
 * @returns boolean
 */
export function isValidDate(date: unknown): date is Date {
  if (Object.prototype.toString.call(date) !== '[object Date]') {
    return false
  }
  const dateObj = date as Date
  return dateObj.getTime() === dateObj.getTime()
}
