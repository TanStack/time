import { Temporal } from '@js-temporal/polyfill'
import type { Event, Resource } from './types'
import { endOf, startOf } from '~/date'

export const splitMultiDayEvents = <
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  event: TEvent,
  timeZone: Temporal.TimeZoneLike,
): Array<TEvent> => {
  const startDate = Temporal.PlainDateTime.from(event.start).toZonedDateTime(
    timeZone,
  )
  const endDate = Temporal.PlainDateTime.from(event.end).toZonedDateTime(
    timeZone,
  )
  const events: Array<TEvent> = []

  let currentDay = startDate
  while (Temporal.ZonedDateTime.compare(currentDay, endDate) < 0) {
    const startOfDay = startOf(currentDay, { unit: 'day' }).asZonedDateTime()
    const endOfDay = endOf(currentDay, { unit: 'day' }).asZonedDateTime()

    const eventStart =
      Temporal.ZonedDateTime.compare(currentDay, startDate) === 0
        ? startDate
        : startOfDay
    const eventEnd =
      Temporal.ZonedDateTime.compare(endDate, endOfDay) < 0 ? endDate : endOfDay

    events.push({
      ...event,
      start: eventStart.toString(),
      end: eventEnd.toString(),
    })

    currentDay = startOfDay.add({ days: 1 })
  }

  return events
}
