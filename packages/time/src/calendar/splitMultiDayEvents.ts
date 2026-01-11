import { Temporal } from '@js-temporal/polyfill'
import { endOf, startOf } from '../utils'
import type { Event, Resource } from './types'

export const splitMultiDayEvents = <
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  event: TEvent,
  timeZone: Temporal.TimeZoneLike,
): TEvent[] => {
  const startDate = Temporal.PlainDateTime.from(event.start).toZonedDateTime(
    timeZone,
  )
  const endDate = Temporal.PlainDateTime.from(event.end).toZonedDateTime(
    timeZone,
  )
  const events: TEvent[] = []

  let currentDay = startDate
  while (Temporal.ZonedDateTime.compare(currentDay, endDate) < 0) {
    const eventStart =
      Temporal.ZonedDateTime.compare(currentDay, startDate) === 0
        ? startDate
        : startOf({ date: currentDay, unit: 'day' })
    const eventEnd =
      Temporal.ZonedDateTime.compare(
        endDate,
        endOf({ date: currentDay, unit: 'day' }),
      ) < 0
        ? endDate
        : endOf({ date: currentDay, unit: 'day' })

    events.push({
      ...event,
      start: eventStart.toString(),
      end: eventEnd.toString(),
    })

    currentDay = startOf({ date: currentDay, unit: 'day' }).add({ days: 1 })
  }

  return events
}
