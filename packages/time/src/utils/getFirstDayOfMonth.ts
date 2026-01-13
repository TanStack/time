import { Temporal } from '@js-temporal/polyfill'

export const getFirstDayOfMonth = (currMonth: string) =>
  Temporal.PlainDate.from(`${currMonth}-01`)
