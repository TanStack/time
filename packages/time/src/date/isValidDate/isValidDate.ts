export function isValidDate(date: unknown): date is Date {
  if (Object.prototype.toString.call(date) !== '[object Date]') {
    return false
  }
  const dateObj = date as Date
  return dateObj.getTime() === dateObj.getTime()
}
