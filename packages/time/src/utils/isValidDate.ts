/**
 * isValidDate
 * Verifies if a date is a JS Date object and is valid
 * @param date Date
 * @returns boolean
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}
