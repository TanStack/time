import { describe, expect, it } from 'vitest'
import { Kernel } from '../../index'
import type { KernelEvent } from '../../index'
import {
  EDIT_OCCURRENCE_INTENT,
  editOccurrenceIntent,
  recurrenceModule,
  REMOVE_OCCURRENCE_INTENT,
  removeOccurrenceIntent,
} from '../index'
import type {
  EditOccurrencePayload,
  RecurrenceModuleOptions,
  RemoveOccurrencePayload,
} from '../index'

interface CalEvent extends KernelEvent {
  title: string
  recurrence?: {
    frequency: 'daily'
    count?: number
    until?: string
    exDates?: Array<string>
    overrides?: Array<Record<string, unknown>>
  }
}

const options: RecurrenceModuleOptions = {}

const master = (): CalEvent => ({
  id: 'm',
  title: 'Daily',
  start: '2026-01-05T09:00:00',
  end: '2026-01-05T10:00:00',
  recurrence: { frequency: 'daily' },
})

const makeKernel = () =>
  new Kernel<CalEvent>({ events: [master()] }).use(recurrenceModule<CalEvent>(options))

describe('recurrenceModule projection', () => {
  it('expands a recurring master into occurrences within the viewport', () => {
    const projected = makeKernel().project({
      start: '2026-01-05T00:00:00',
      end: '2026-01-07T23:59:59',
    })

    expect(projected.map((e) => e.start)).toEqual([
      '2026-01-05T09:00:00',
      '2026-01-06T09:00:00',
      '2026-01-07T09:00:00',
    ])
  })

  it('passes non-recurring events through untouched', () => {
    const kernel = new Kernel<CalEvent>({
      events: [
        {
          id: 'one',
          title: 'Once',
          start: '2026-01-05T09:00:00',
          end: '2026-01-05T10:00:00',
        },
      ],
    }).use(recurrenceModule<CalEvent>(options))

    const projected = kernel.project({
      start: '2026-01-05T00:00:00',
      end: '2026-01-07T23:59:59',
    })

    expect(projected).toHaveLength(1)
    expect(projected[0]!.id).toBe('one')
  })
})

describe('recurrenceModule materialize', () => {
  it("tags intents with the module's namespaced intent names", () => {
    expect(editOccurrenceIntent({ masterId: 'm', scope: 'this', updates: {} }).intent).toBe(
      EDIT_OCCURRENCE_INTENT,
    )
    expect(removeOccurrenceIntent({ masterId: 'm', scope: 'this' }).intent).toBe(
      REMOVE_OCCURRENCE_INTENT,
    )
  })

  it('expands an edit intent with scope "this" into a master override update', () => {
    const kernel = makeKernel()
    const payload: EditOccurrencePayload = {
      masterId: 'm',
      scope: 'this',
      occurrenceStart: '2026-01-08T09:00:00',
      updates: { start: '2026-01-08T14:00:00' },
    }

    const result = kernel.write(editOccurrenceIntent(payload))

    expect(result.status).toBe('committed')
    if (result.status === 'committed') {
      expect(result.batch.ops).toHaveLength(1)
      expect(result.batch.ops[0]!.kind).toBe('update')
    }

    const override = kernel
      .getEvent('m')!
      .recurrence!.overrides!.find((o) => o.originalStart === '2026-01-08T09:00:00')
    expect(override!.start).toBe('2026-01-08T14:00:00')
    expect(override!.end).toBe('2026-01-08T15:00:00')
  })

  it('expands an edit intent with scope "thisAndFollowing" into a split pair', () => {
    const kernel = makeKernel()
    const result = kernel.write(
      editOccurrenceIntent({
        masterId: 'm',
        scope: 'thisAndFollowing',
        occurrenceStart: '2026-01-08T09:00:00',
        updates: { start: '2026-01-08T11:00:00' },
      }),
    )

    expect(result.status).toBe('committed')
    if (result.status === 'committed') {
      expect(result.batch.ops.map((o) => o.kind)).toEqual(['update', 'add'])
    }

    expect(kernel.getEvent('m')!.recurrence!.until).toBe('2026-01-08')
    const split = kernel.getEvents().find((e) => e.id !== 'm' && e.start === '2026-01-08T11:00:00')
    expect(split).toBeDefined()
    expect(split!.recurrence!.frequency).toBe('daily')
  })

  it('expands a remove intent with scope "this" into an exDate update', () => {
    const kernel = makeKernel()
    const payload: RemoveOccurrencePayload = {
      masterId: 'm',
      scope: 'this',
      occurrenceStart: '2026-01-08T09:00:00',
    }

    kernel.write(removeOccurrenceIntent(payload))

    expect(kernel.getEvent('m')!.recurrence!.exDates).toContain('2026-01-08T09:00:00')
  })

  it('expands a remove intent with scope "all" into a master remove', () => {
    const kernel = makeKernel()
    kernel.write(removeOccurrenceIntent({ masterId: 'm', scope: 'all' }))
    expect(kernel.getEvents()).toHaveLength(0)
  })

  it('rolls back a materialized split as one atomic batch', () => {
    const kernel = makeKernel()
    kernel.write(
      editOccurrenceIntent({
        masterId: 'm',
        scope: 'thisAndFollowing',
        occurrenceStart: '2026-01-08T09:00:00',
        updates: { start: '2026-01-08T11:00:00' },
      }),
    )
    expect(kernel.getEvents()).toHaveLength(2)

    kernel.rollback()

    expect(kernel.getEvents()).toHaveLength(1)
    expect(kernel.getEvent('m')!.recurrence!.until).toBeUndefined()
  })

  it('drops the intent when the master is unknown', () => {
    const kernel = makeKernel()
    const result = kernel.write(
      editOccurrenceIntent({
        masterId: 'missing',
        scope: 'this',
        updates: {},
      }),
    )

    expect(result.status).toBe('committed')
    if (result.status === 'committed') {
      expect(result.batch.ops).toHaveLength(0)
    }
  })

  it('declares the range a recurring edit requires', () => {
    const kernel = makeKernel()
    const range = kernel.getRequiredRange(
      editOccurrenceIntent({
        masterId: 'm',
        scope: 'this',
        occurrenceStart: '2026-01-08T09:00:00',
        updates: { start: '2026-01-10T11:00:00' },
      }),
    )

    expect(range).toEqual({ start: '2026-01-08', end: '2026-01-11' })
  })
})

describe('kernel intent invariant', () => {
  it('throws when no module expands an intent', () => {
    const kernel = new Kernel<CalEvent>({ events: [master()] })

    expect(() =>
      kernel.write(editOccurrenceIntent({ masterId: 'm', scope: 'this', updates: {} })),
    ).toThrow(/unresolved intent/i)
  })
})
