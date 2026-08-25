import { describe, expect, test } from 'vitest'
import { createCalendar } from '../calendar'
import {
  calendarFeatures,
  dayEventLayoutFeature,
  eventFilterFeature,
  eventRecurrenceFeature,
} from '../features'
import type { CalendarFeatureList, FullFeatureApi } from '../features'
import type { Event, Resource } from '../types'

type TestEvent = Event<Resource> & { categoryId?: string }

const DAY = '2025-06-02'

const workEvent: TestEvent = {
  id: 'work',
  title: 'Work',
  start: `${DAY}T09:00:00`,
  end: `${DAY}T10:00:00`,
  categoryId: 'work',
}

const personalEvent: TestEvent = {
  id: 'personal',
  title: 'Personal',
  start: `${DAY}T09:30:00`,
  end: `${DAY}T11:00:00`,
  categoryId: 'personal',
}

function createTestCalendar<TFeatures extends CalendarFeatureList>(
  features: TFeatures,
  events: Array<TestEvent>,
) {
  const cal = createCalendar<TFeatures, Resource, TestEvent>({
    viewMode: { value: 1, unit: 'day' },
    timeZone: 'UTC',
    events,
    features,
  })
  cal.goToSpecificPeriod(DAY)
  return cal
}

const titlesOn = (cal: { getEventsByDate: (date: string) => Array<TestEvent> }) =>
  cal
    .getEventsByDate(DAY)
    .map((event) => event.title)
    .sort()

describe('eventFilterFeature', () => {
  test('hides events that fail a registered predicate', () => {
    const cal = createTestCalendar(calendarFeatures([eventFilterFeature]), [
      workEvent,
      personalEvent,
    ])

    expect(titlesOn(cal)).toEqual(['Personal', 'Work'])

    cal.setEventFilter('category', (event) => event.categoryId === 'work')

    expect(titlesOn(cal)).toEqual(['Work'])
    expect(cal.getEventFilterIds()).toEqual(['category'])
  })

  test('combines every registered filter with AND', () => {
    const cal = createTestCalendar(calendarFeatures([eventFilterFeature]), [
      workEvent,
      personalEvent,
    ])

    cal.setEventFilter('category', (event) => event.categoryId !== 'personal')
    cal.setEventFilter('search', (event) => event.title.startsWith('P'))

    expect(titlesOn(cal)).toEqual([])

    cal.setEventFilter('search', null)

    expect(titlesOn(cal)).toEqual(['Work'])
  })

  test('clearEventFilters restores every event', () => {
    const cal = createTestCalendar(calendarFeatures([eventFilterFeature]), [
      workEvent,
      personalEvent,
    ])

    cal.setEventFilter('category', () => false)
    expect(titlesOn(cal)).toEqual([])

    cal.clearEventFilters()

    expect(titlesOn(cal)).toEqual(['Personal', 'Work'])
    expect(cal.getEventFilterIds()).toEqual([])
  })

  test('does not remove filtered events from the store', () => {
    const cal = createTestCalendar(calendarFeatures([eventFilterFeature]), [
      workEvent,
      personalEvent,
    ])

    cal.setEventFilter('category', (event) => event.categoryId === 'work')

    expect(
      cal
        .getEvents()
        .map((event) => event.id)
        .sort(),
    ).toEqual(['personal', 'work'])
    expect(cal.getHiddenEvents().map((event) => event.id)).toEqual(['personal'])
    expect(cal.isEventVisible(workEvent)).toBe(true)
  })

  test('bumps eventsVersion so subscribers recompute days', () => {
    const cal = createTestCalendar(calendarFeatures([eventFilterFeature]), [
      workEvent,
      personalEvent,
    ])
    const before = cal.store.state.eventsVersion

    cal.setEventFilter('category', (event) => event.categoryId === 'work')
    expect(cal.store.state.eventsVersion).toBe(before + 1)

    cal.setEventFilter('missing', null)
    expect(cal.store.state.eventsVersion).toBe(before + 1)
  })

  test('filters expanded recurrence occurrences', () => {
    const cal = createTestCalendar(calendarFeatures([eventFilterFeature, eventRecurrenceFeature]), [
      {
        ...workEvent,
        recurrence: { frequency: 'daily', interval: 1 },
      },
    ])

    expect(titlesOn(cal)).toEqual(['Work'])

    cal.setEventFilter('category', (event) => event.categoryId === 'personal')

    expect(titlesOn(cal)).toEqual([])
  })

  test('hidden events do not take layout space from visible ones', () => {
    const cal = createTestCalendar(calendarFeatures([eventFilterFeature, dayEventLayoutFeature]), [
      workEvent,
      personalEvent,
    ])

    expect(cal.getEventProps(cal.getEventsByDate(DAY)[0]!).layout?.concurrency).toBe(2)

    cal.setEventFilter('category', (event) => event.categoryId === 'work')

    const visible = cal.getEventsByDate(DAY)
    expect(visible).toHaveLength(1)
    expect(cal.getEventProps(visible[0]!).layout?.concurrency).toBe(1)
  })

  test('the api is unreachable when the feature is not composed', () => {
    const cal = createTestCalendar(calendarFeatures([dayEventLayoutFeature]), [workEvent])

    expect(() =>
      (cal as unknown as FullFeatureApi<Resource, TestEvent>).setEventFilter(
        'category',
        () => true,
      ),
    ).toThrow(
      'CalendarCore: "setEventFilter" requires eventFilterFeature. Compose it via calendarFeatures([eventFilterFeature, ...]).',
    )
  })
})
