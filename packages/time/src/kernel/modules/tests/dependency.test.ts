import { describe, expect, it } from 'vitest'
import { Kernel } from '../../index'
import type { KernelEvent } from '../../index'
import { dependencyModule } from '../index'
import type { DependencyModuleOptions } from '../index'
import type { DependencyLink } from '~/validation/dependency'

interface CalEvent extends KernelEvent {
  title: string
  dependsOn?: Array<DependencyLink>
  manuallyScheduled?: boolean
}

const options: DependencyModuleOptions = { timeZone: 'UTC' }

const seed = () => {
  const kernel = new Kernel<CalEvent>().use(dependencyModule<CalEvent>(options))
  kernel.write({
    kind: 'add',
    event: {
      id: 'a',
      title: 'A',
      start: '2026-01-05T09:00:00',
      end: '2026-01-05T10:00:00',
    },
  })
  kernel.write({
    kind: 'add',
    event: {
      id: 'b',
      title: 'B',
      start: '2026-01-05T10:00:00',
      end: '2026-01-05T11:00:00',
      dependsOn: [{ id: 'a', type: 'FS' }],
    },
  })
  return kernel
}

describe('dependencyModule', () => {
  it('cascades a dependent forward when the predecessor moves', () => {
    const kernel = seed()

    const result = kernel.write({
      kind: 'update',
      id: 'a',
      before: kernel.getEvent('a')!,
      after: {
        ...kernel.getEvent('a')!,
        start: '2026-01-05T10:00:00',
        end: '2026-01-05T11:00:00',
      },
    })

    expect(result.status).toBe('committed')
    const b = kernel.getEvent('b')!
    expect(b.start).toBe('2026-01-05T11:00:00')
    expect(b.end).toBe('2026-01-05T12:00:00')
  })

  it('cascades when only the end moves', () => {
    const kernel = seed()

    kernel.write({
      kind: 'update',
      id: 'a',
      before: kernel.getEvent('a')!,
      after: { ...kernel.getEvent('a')!, end: '2026-01-05T11:00:00' },
    })

    const b = kernel.getEvent('b')!
    expect(b.start).toBe('2026-01-05T11:00:00')
    expect(b.end).toBe('2026-01-05T12:00:00')
  })

  it('pulls a predecessor back when the dependent moves earlier', () => {
    const kernel = seed()

    kernel.write({
      kind: 'update',
      id: 'b',
      before: kernel.getEvent('b')!,
      after: {
        ...kernel.getEvent('b')!,
        start: '2026-01-05T09:00:00',
        end: '2026-01-05T10:00:00',
      },
    })

    const a = kernel.getEvent('a')!
    expect(a.start).toBe('2026-01-05T08:00:00')
    expect(a.end).toBe('2026-01-05T09:00:00')
  })

  it('ignores updates that move neither edge', () => {
    const kernel = seed()

    kernel.write({
      kind: 'update',
      id: 'a',
      before: kernel.getEvent('a')!,
      after: { ...kernel.getEvent('a')!, title: 'Renamed' },
    })

    expect(kernel.getEvent('b')!.start).toBe('2026-01-05T10:00:00')
  })

  it('rejects a move an anchored dependent cannot follow', () => {
    const kernel = seed()
    kernel.write({
      kind: 'update',
      id: 'b',
      before: kernel.getEvent('b')!,
      after: { ...kernel.getEvent('b')!, manuallyScheduled: true },
    })

    const result = kernel.write({
      kind: 'update',
      id: 'a',
      before: kernel.getEvent('a')!,
      after: {
        ...kernel.getEvent('a')!,
        start: '2026-01-05T10:00:00',
        end: '2026-01-05T11:00:00',
      },
    })

    expect(result.status).toBe('rejected')
    if (result.status !== 'rejected') return
    expect(result.conflicts[0]).toMatchObject({
      code: 'dependency/manually-scheduled',
      eventIds: ['b', 'a'],
    })
    expect(kernel.getEvent('a')!.start).toBe('2026-01-05T09:00:00')
    expect(kernel.getEvent('b')!.start).toBe('2026-01-05T10:00:00')
  })

  it('commits a move an anchored dependent still has slack for', () => {
    const kernel = seed()
    kernel.write({
      kind: 'update',
      id: 'b',
      before: kernel.getEvent('b')!,
      after: { ...kernel.getEvent('b')!, manuallyScheduled: true },
    })

    const result = kernel.write({
      kind: 'update',
      id: 'a',
      before: kernel.getEvent('a')!,
      after: {
        ...kernel.getEvent('a')!,
        start: '2026-01-05T08:00:00',
        end: '2026-01-05T09:00:00',
      },
    })

    expect(result.status).toBe('committed')
    expect(kernel.getEvent('b')!.start).toBe('2026-01-05T10:00:00')
  })

  it('rejects pulling an anchored predecessor back', () => {
    const kernel = seed()
    kernel.write({
      kind: 'update',
      id: 'a',
      before: kernel.getEvent('a')!,
      after: { ...kernel.getEvent('a')!, manuallyScheduled: true },
    })

    const result = kernel.write({
      kind: 'update',
      id: 'b',
      before: kernel.getEvent('b')!,
      after: {
        ...kernel.getEvent('b')!,
        start: '2026-01-05T09:00:00',
        end: '2026-01-05T10:00:00',
      },
    })

    expect(result.status).toBe('rejected')
    expect(kernel.getEvent('a')!.start).toBe('2026-01-05T09:00:00')
  })

  it('moves an anchor when the write targets it directly', () => {
    const kernel = seed()
    kernel.write({
      kind: 'update',
      id: 'a',
      before: kernel.getEvent('a')!,
      after: { ...kernel.getEvent('a')!, manuallyScheduled: true },
    })

    const result = kernel.write({
      kind: 'update',
      id: 'a',
      before: kernel.getEvent('a')!,
      after: {
        ...kernel.getEvent('a')!,
        start: '2026-01-05T10:00:00',
        end: '2026-01-05T11:00:00',
      },
    })

    expect(result.status).toBe('committed')
    expect(kernel.getEvent('a')!.start).toBe('2026-01-05T10:00:00')
    expect(kernel.getEvent('b')!.start).toBe('2026-01-05T11:00:00')
  })

  it('leaves dependents untouched when no constraint is violated', () => {
    const kernel = seed()

    kernel.write({
      kind: 'update',
      id: 'a',
      before: kernel.getEvent('a')!,
      after: {
        ...kernel.getEvent('a')!,
        start: '2026-01-05T08:00:00',
        end: '2026-01-05T09:00:00',
      },
    })

    const b = kernel.getEvent('b')!
    expect(b.start).toBe('2026-01-05T10:00:00')
  })
})
