import { describe, expect, test, vi } from 'vitest'
import { createCalendar } from '../calendar'
import { stockFeatures } from '../features'
import type { StockFeatures } from '../features'
import { MoveController } from '../moveController'
import type { MoveHost } from '../moveController'
import type { Event, Resource, ValidateMoveOptions } from '../types'

type TestResource = Resource
type TestEvent = Event<TestResource>

const DAY = '2025-06-02'
const NEXT_DAY = '2025-06-03'
const START = `${DAY}T09:00:00`
const END = `${DAY}T10:00:00`

function createHost(overrides: Partial<MoveHost<TestResource, TestEvent>> = {}) {
  const validated: Array<ValidateMoveOptions> = []
  const host = {
    getEvent: () => undefined,
    getEvents: () => [],
    getState: () => ({
      currentPeriod: DAY,
      activeDate: DAY,
      viewMode: { value: 1, unit: 'week' as const },
      eventsVersion: 0,
      isPending: false,
    }),
    getOptions: () => ({ timeZone: 'UTC', resources: null }),
    getEventMap: () => new Map(),
    getDaysWithEvents: () => [],
    getEventsByDate: () => [],
    invalidateEvents: () => {},
    goToSpecificPeriod: () => {},
    write: () => [],
    fetchEventsForRange: async () => {},
    removeEvent: () => {},
    commitUpdate: () => {},
    validateMove: () => ({ blocked: false }),
    validateEventDependencies: () => ({ valid: true }),
    validateEventPlacement: () => ({ blocked: false }),
    resolveMasterEventId: (id: string) => id,
    editEvent: vi.fn(async () => ({ success: true as const })),
    editRecurringEvent: vi.fn(async () => ({ success: true as const })),
    validateEventMove: (options: ValidateMoveOptions) => {
      validated.push(options)
      const dayShift = options.targetDayDate === NEXT_DAY ? 1 : 0
      const hour = 9 + Math.round(options.minuteShift / 60)
      const date = dayShift === 1 ? NEXT_DAY : DAY
      return {
        blocked: false,
        result: {
          start: `${date}T${String(hour).padStart(2, '0')}:00:00`,
          end: `${date}T${String(hour + 1).padStart(2, '0')}:00:00`,
          durationMinutes: 60,
          moved: dayShift !== 0 || options.minuteShift !== 0,
        },
        targetDayDate: options.targetDayDate,
      }
    },
    ...overrides,
  } as unknown as MoveHost<TestResource, TestEvent> & {
    editEvent: ReturnType<typeof vi.fn>
    editRecurringEvent: ReturnType<typeof vi.fn>
  }

  return { host, validated }
}

function startMove(
  controller: MoveController<TestResource, TestEvent>,
  args: { occurrenceStart?: string; recurrenceScope?: 'this' | 'all' } = {},
) {
  return controller.start({
    eventId: 'e1',
    originalStart: START,
    originalEnd: END,
    dayDate: DAY,
    ...args,
  })
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('MoveController', () => {
  test('asks the host to validate every processed position', () => {
    const { host, validated } = createHost()
    const controller = new MoveController(host, { containerHeight: 1440 })

    expect(startMove(controller)).toBe(true)
    controller.moveTo({ dayDate: NEXT_DAY, deltaPixels: 60 })

    expect(validated).toHaveLength(1)
    expect(validated[0]!.eventId).toBe('e1')
    expect(validated[0]!.originalDayDate).toBe(DAY)
    expect(validated[0]!.targetDayDate).toBe(NEXT_DAY)
    expect(validated[0]!.minuteShift).toBe(60)
    expect(controller.getSnapshot().previewStart).toBe(`${NEXT_DAY}T10:00:00`)
  })

  test('converts pixels through the container height', () => {
    const { host, validated } = createHost()
    const controller = new MoveController(host, { containerHeight: 720 })

    startMove(controller)
    controller.moveTo({ deltaPixels: 60 })

    expect(validated[0]!.minuteShift).toBe(120)
  })

  test('accepts minutes directly', () => {
    const { host, validated } = createHost()
    const controller = new MoveController(host, {})

    startMove(controller)
    controller.moveTo({ deltaMinutes: 45 })

    expect(validated[0]!.minuteShift).toBe(45)
  })

  test('skips positions that snap to the same slot', () => {
    const { host, validated } = createHost()
    const controller = new MoveController(host, { containerHeight: 1440 })

    startMove(controller)
    controller.moveTo({ deltaMinutes: 60 })
    controller.moveTo({ deltaMinutes: 62 })
    controller.moveTo({ deltaMinutes: 75 })

    expect(validated).toHaveLength(2)
  })

  test('does nothing before a move has started', () => {
    const { host, validated } = createHost()
    const controller = new MoveController(host, {})

    controller.moveTo({ deltaMinutes: 60 })

    expect(validated).toHaveLength(0)
    expect(controller.getSnapshot().isMoving).toBe(false)
  })

  test('refuses to start when disabled', () => {
    const { host } = createHost()
    const controller = new MoveController(host, { enabled: false })

    expect(startMove(controller)).toBe(false)
    expect(controller.getSnapshot().isMoving).toBe(false)
  })

  test('pins the minute shift to zero at day granularity', () => {
    const { host, validated } = createHost()
    const controller = new MoveController(host, {})

    controller.start({
      eventId: 'e1',
      originalStart: START,
      originalEnd: END,
      dayDate: DAY,
      granularity: 'day',
    })
    controller.moveTo({ dayDate: NEXT_DAY, deltaMinutes: 240 })

    expect(validated[0]!.minuteShift).toBe(0)
    expect(validated[0]!.granularity).toBe('day')
  })

  test('keeps the last valid preview and reports the blocking error', () => {
    const onMoveError = vi.fn()
    const { host } = createHost({
      validateEventMove: (options) => ({
        blocked: true,
        error: {
          reason: 'unavailable-time' as const,
          message: 'nope',
          conflicts: [],
        },
        result: {
          start: options.originalStart,
          end: options.originalEnd,
          durationMinutes: 60,
          moved: false,
        },
        targetDayDate: options.originalDayDate,
      }),
    })
    const controller = new MoveController(host, { onMoveError })

    startMove(controller)
    controller.moveTo({ deltaMinutes: 60 })

    const state = controller.getSnapshot()
    expect(state.blocked).toBe(true)
    expect(state.previewStart).toBe(START)
    expect(onMoveError).toHaveBeenCalledTimes(1)
    expect(onMoveError.mock.calls[0]![0]).toMatchObject({
      eventId: 'e1',
      kind: 'move',
      message: 'nope',
    })
  })

  test('commits a plain move through editEvent', async () => {
    const { host } = createHost()
    const onMoveEnd = vi.fn()
    const controller = new MoveController(host, { onMoveEnd })

    startMove(controller)
    controller.moveTo({ deltaMinutes: 60 })
    controller.end()
    await flush()

    expect(host.editEvent).toHaveBeenCalledWith('e1', {
      start: `${DAY}T10:00:00`,
      end: `${DAY}T11:00:00`,
    })
    expect(onMoveEnd).toHaveBeenCalledWith('e1', `${DAY}T10:00:00`, `${DAY}T11:00:00`)
    expect(controller.getSnapshot().isMoving).toBe(false)
  })

  test('commits against the master id of an occurrence', async () => {
    const { host } = createHost({ resolveMasterEventId: () => 'master' })
    const controller = new MoveController(host, {})

    startMove(controller)
    controller.moveTo({ deltaMinutes: 60 })
    controller.end()
    await flush()

    expect(host.editEvent.mock.calls[0]![0]).toBe('master')
  })

  test('does not commit when the position never changed', async () => {
    const { host } = createHost()
    const onMoveEnd = vi.fn()
    const controller = new MoveController(host, { onMoveEnd })

    startMove(controller)
    controller.moveTo({ deltaMinutes: 0 })
    controller.end()
    await flush()

    expect(host.editEvent).not.toHaveBeenCalled()
    expect(onMoveEnd).not.toHaveBeenCalled()
  })

  test('surfaces a rejected commit as a move error', async () => {
    const onMoveError = vi.fn()
    const { host } = createHost({
      editEvent: vi.fn(async () => ({
        success: false as const,
        error: {
          eventId: 'e1',
          eventTitle: 'E',
          reason: 'blocked' as const,
          message: 'rejected',
          originalStart: START,
          originalEnd: END,
        },
      })),
    })
    const controller = new MoveController(host, { onMoveError })

    startMove(controller)
    controller.moveTo({ deltaMinutes: 60 })
    controller.end()
    await flush()

    expect(onMoveError).toHaveBeenCalledTimes(1)
    expect(onMoveError.mock.calls[0]![0]).toMatchObject({
      kind: 'move',
      message: 'rejected',
    })
  })

  test('hands an unscoped occurrence move back to the caller', () => {
    const onRecurringMoveEnd = vi.fn()
    const { host } = createHost()
    const controller = new MoveController(host, { onRecurringMoveEnd })

    startMove(controller, { occurrenceStart: START })
    controller.moveTo({ deltaMinutes: 60 })
    controller.end()

    expect(host.editRecurringEvent).not.toHaveBeenCalled()
    expect(onRecurringMoveEnd).toHaveBeenCalledWith({
      eventId: 'e1',
      occurrenceStart: START,
      originalStart: START,
      originalEnd: END,
      newStart: `${DAY}T10:00:00`,
      newEnd: `${DAY}T11:00:00`,
    })
  })

  test('commits a scoped occurrence move through editRecurringEvent', async () => {
    const { host } = createHost()
    const controller = new MoveController(host, {})

    startMove(controller, { occurrenceStart: START, recurrenceScope: 'all' })
    controller.moveTo({ deltaMinutes: 60 })
    controller.end()
    await flush()

    expect(host.editEvent).not.toHaveBeenCalled()
    expect(host.editRecurringEvent).toHaveBeenCalledWith(
      'e1',
      { start: `${DAY}T10:00:00`, end: `${DAY}T11:00:00` },
      { scope: 'all', occurrenceStart: START },
    )
  })

  test('cancel drops the drag without committing', async () => {
    const { host } = createHost()
    const controller = new MoveController(host, {})

    startMove(controller)
    controller.moveTo({ deltaMinutes: 60 })
    controller.cancel()
    controller.end()
    await flush()

    expect(host.editEvent).not.toHaveBeenCalled()
    expect(controller.getSnapshot()).toMatchObject({
      isMoving: false,
      previewStart: null,
    })
  })

  test('notifies subscribers on every state change', () => {
    const { host } = createHost()
    const controller = new MoveController(host, {})
    const listener = vi.fn()
    const unsubscribe = controller.subscribe(listener)

    startMove(controller)
    controller.moveTo({ deltaMinutes: 60 })
    unsubscribe()
    controller.cancel()

    expect(listener).toHaveBeenCalledTimes(2)
  })
})

describe('eventMoveFeature api', () => {
  function createTestCalendar(events: Array<TestEvent>) {
    return createCalendar<StockFeatures, TestResource, TestEvent>({
      viewMode: { value: 1, unit: 'week' },
      timeZone: 'UTC',
      features: stockFeatures,
      events,
    })
  }

  test('validateEventMove resolves the drop target into new times', () => {
    const cal = createTestCalendar([{ id: 'e1', title: 'E', start: START, end: END }])

    const validation = cal.validateEventMove({
      eventId: 'e1',
      originalStart: START,
      originalEnd: END,
      originalDayDate: DAY,
      targetDayDate: NEXT_DAY,
      minuteShift: 30,
    })

    expect(validation.blocked).toBe(false)
    expect(validation.result).toMatchObject({
      start: `${NEXT_DAY}T09:30:00`,
      end: `${NEXT_DAY}T10:30:00`,
      moved: true,
    })
  })

  test('validateEventMove blocks a drop outside working hours', () => {
    const cal = createCalendar<StockFeatures, TestResource, TestEvent>({
      viewMode: { value: 1, unit: 'week' },
      timeZone: 'UTC',
      features: stockFeatures,
      resources: [{ id: 'r1', label: 'R', calendarId: 'office' }],
      calendars: [
        {
          id: 'office',
          label: 'Office',
          intervals: [
            {
              isWorking: true,
              recurrent: {
                weekdays: [1, 2, 3, 4, 5],
                startTime: '09:00',
                endTime: '17:00',
              },
            },
          ],
        },
      ],
      events: [{ id: 'e1', title: 'E', start: START, end: END, resources: ['r1'] }],
    })

    const validation = cal.validateEventMove({
      eventId: 'e1',
      originalStart: START,
      originalEnd: END,
      originalDayDate: DAY,
      targetDayDate: DAY,
      minuteShift: -180,
    })

    expect(validation.blocked).toBe(true)
    expect(validation.error?.reason).toBe('unavailable-time')
    expect(validation.result.start).toBe(START)
    expect(validation.targetDayDate).toBe(DAY)
  })

  test('createMoveController commits through the calendar', async () => {
    const cal = createTestCalendar([{ id: 'e1', title: 'E', start: START, end: END }])
    const controller = cal.createMoveController({ containerHeight: 1440 })

    controller.start({
      eventId: 'e1',
      originalStart: START,
      originalEnd: END,
      dayDate: DAY,
    })
    controller.moveTo({ dayDate: NEXT_DAY, deltaPixels: 60 })
    controller.end()
    await flush()

    expect(cal.getEvents()[0]).toMatchObject({
      start: `${NEXT_DAY}T10:00:00`,
      end: `${NEXT_DAY}T11:00:00`,
    })
  })
})
