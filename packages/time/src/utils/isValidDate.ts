/**
 * isValidDate
 * Verifies if a date is a JS Date object and is valid
 * @param date Date
 * @returns boolean
 */
export function isValidDate(date: any): boolean {
  if (Object.prototype.toString.call(date) !== '[object Date]') {
    return false
  }
  return date.getTime() === date.getTime()
}
