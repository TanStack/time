import { describe, expect, test } from 'vitest'
import { createCalendar } from '../calendar'
import { calendarFeatures, dayEventLayoutFeature, eventRecurrenceFeature } from '../features'
import type { Event, Resource } from '../types'

const features = calendarFeatures([dayEventLayoutFeature, eventRecurrenceFeature])

const standup: Event<Resource> = {
  id: 'standup',
  title: 'Daily Standup',
  start: '2025-06-02T09:00:00',
  end: '2025-06-02T09:15:00',
  recurrence: { frequency: 'daily', interval: 1 },
}

function createCalendarAt(isoDate: string) {
  const cal = createCalendar<typeof features, Resource, Event<Resource>>({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    events: [standup],
    features,
  })
  cal.goToSpecificPeriod(isoDate)
  return cal
}

async function stretchOccurrenceIntoNextDay(cal: ReturnType<typeof createCalendarAt>) {
  const occurrence = cal.getEventsByDate('2025-06-04')[0]!
  const result = await cal.editRecurringEvent(
    occurrence.id,
    { start: '2025-06-04T09:00:00', end: '2025-06-05T10:00:00' },
    {
      scope: 'this',
      occurrenceStart: occurrence._occurrenceOriginalStart ?? occurrence.start,
    },
  )
  expect(result.success).toBe(true)
}

describe('occurrence spanning past midnight', () => {
  test('the trailing segment is bucketed on the day it continues into', async () => {
    const cal = createCalendarAt('2025-06-04')
    await stretchOccurrenceIntoNextDay(cal)

    expect(cal.getEventsByDate('2025-06-05').map((e) => [e.id, e.start, e.end])).toEqual([
      ['standup_2', '2025-06-05T00:00:00', '2025-06-05T10:00:00'],
      ['standup_3', '2025-06-05T09:00:00', '2025-06-05T09:15:00'],
    ])
  })

  test('the next occurrence shares columns with the trailing segment', async () => {
    const cal = createCalendarAt('2025-06-04')
    await stretchOccurrenceIntoNextDay(cal)

    const [tail, next] = cal.getEventsByDate('2025-06-05')

    expect(cal.getEventProps(tail!).style).toMatchObject({
      left: '0%',
      width: '50%',
    })
    expect(cal.getEventProps(next!).style).toMatchObject({
      left: '50%',
      width: '50%',
    })
  })
})
