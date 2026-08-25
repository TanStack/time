import { describe, expect, it } from 'vitest'
import { createCalendar } from '~/calendar/calendar'
import { stockFeatures } from '~/calendar/features'
import { Kernel } from '~/kernel'
import { recurrenceModule } from '~/kernel/modules'
import { buildDays } from '../index'
import type { Event, Resource } from '~/calendar/types'
import type { KernelEvent } from '~/kernel'

type ProjectableEvent = Event & KernelEvent

const UTC = 'UTC'

const events: Array<Event> = [
  {
    id: 'plain',
    title: 'Plain',
    start: '2025-06-03T10:00:00',
    end: '2025-06-03T11:00:00',
  },
  {
    id: 'multiday',
    title: 'Multi day',
    start: '2025-06-04T22:00:00',
    end: '2025-06-06T02:00:00',
  },
  {
    id: 'allday',
    title: 'All day',
    start: '2025-06-05T00:00:00',
    end: '2025-06-05T23:59:59',
    allDay: true,
  },
  {
    id: 'daily',
    title: 'Daily',
    start: '2025-06-02T09:00:00',
    end: '2025-06-02T09:30:00',
    recurrence: { frequency: 'daily' },
  },
  {
    id: 'weekly',
    title: 'Weekly',
    start: '2025-06-02T15:00:00',
    end: '2025-06-02T16:00:00',
    recurrence: {
      frequency: 'weekly',
      byWeekday: [1, 3],
      exDates: ['2025-06-04T15:00:00'],
      overrides: [
        {
          originalStart: '2025-06-02T15:00:00',
          start: '2025-06-02T17:00:00',
          end: '2025-06-02T18:00:00',
        },
      ],
    },
  },
]

const fingerprint = (list: Array<{ id: string; start: unknown }>) =>
  list
    .map((e) => `${e.id}@${String(e.start)}`)
    .sort()
    .join(',')

describe('days parity: CalendarCore vs kernel projection', () => {
  it('produces the same per-day timed and all-day events', () => {
    const cal = createCalendar<typeof stockFeatures, Resource, Event>({
      features: stockFeatures,
      viewMode: { value: 1, unit: 'week' },
      timeZone: UTC,
      events: events.map((e) => ({ ...e })),
    })
    cal.goToSpecificPeriod('2025-06-03')

    const godDays = cal.getDaysWithEvents()
    const isoDates = godDays.map((d) => d.isoDate)

    const kernel = new Kernel<ProjectableEvent>({
      events: events.map((e) => ({ ...e }) as ProjectableEvent),
    }).use(recurrenceModule<ProjectableEvent>())

    const projected = kernel.project({
      start: `${isoDates[0]!}T00:00:00`,
      end: `${isoDates[isoDates.length - 1]!}T23:59:59`,
    })

    const kernelDays = buildDays({
      isoDates,
      events: projected,
      timeZone: UTC,
    })

    expect(kernelDays.map((d) => d.isoDate)).toEqual(isoDates)

    for (let i = 0; i < isoDates.length; i++) {
      const expected = godDays[i]!
      const actual = kernelDays[i]!

      expect({
        date: actual.isoDate,
        timed: fingerprint(actual.events),
        allDay: fingerprint(actual.allDayEvents),
      }).toEqual({
        date: expected.isoDate,
        timed: fingerprint(expected.events),
        allDay: fingerprint(expected.allDayEvents),
      })
    }
  })

  it('splits the multi-day event across the same days in both paths', () => {
    const cal = createCalendar<typeof stockFeatures, Resource, Event>({
      features: stockFeatures,
      viewMode: { value: 1, unit: 'week' },
      timeZone: UTC,
      events: events.map((e) => ({ ...e })),
    })
    cal.goToSpecificPeriod('2025-06-03')

    const godDays = cal.getDaysWithEvents()
    const godSegmentDays = godDays
      .filter((d) => d.events.some((e) => e.id === 'multiday'))
      .map((d) => d.isoDate)

    expect(godSegmentDays).toEqual(['2025-06-04', '2025-06-05', '2025-06-06'])

    const isoDates = godDays.map((d) => d.isoDate)
    const kernel = new Kernel<ProjectableEvent>({
      events: events.map((e) => ({ ...e }) as ProjectableEvent),
    }).use(recurrenceModule<ProjectableEvent>())
    const kernelDays = buildDays({
      isoDates,
      events: kernel.project({
        start: `${isoDates[0]!}T00:00:00`,
        end: `${isoDates[isoDates.length - 1]!}T23:59:59`,
      }),
      timeZone: UTC,
    })

    expect(
      kernelDays.filter((d) => d.events.some((e) => e.id === 'multiday')).map((d) => d.isoDate),
    ).toEqual(godSegmentDays)
  })
})
