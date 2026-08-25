import { describe, expect, it } from 'vitest'
import { Kernel } from '../../index'
import type { KernelEvent } from '../../index'
import { availabilityModule } from '../index'
import type { AvailabilityModuleOptions, AvailabilityModuleResource } from '../index'

interface CalEvent extends KernelEvent {
  title: string
  resources?: Array<string>
  consumption?: Array<number>
}

const room: AvailabilityModuleResource = {
  id: 'r1',
  label: 'Room 1',
  calendarId: 'office',
}

const options: AvailabilityModuleOptions = {
  resources: [room],
  workingTime: {
    calendars: [
      {
        id: 'office',
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
  },
}

const makeKernel = () => new Kernel<CalEvent>().use(availabilityModule<CalEvent>(options))

describe('availabilityModule', () => {
  it('commits a write inside the availability window', () => {
    const kernel = makeKernel()
    const result = kernel.write({
      kind: 'add',
      event: {
        id: 'e1',
        title: 'OK',
        start: '2026-01-05T10:00:00',
        end: '2026-01-05T11:00:00',
        resources: ['r1'],
      },
    })

    expect(result.status).toBe('committed')
    expect(kernel.getEvents()).toHaveLength(1)
  })

  it('vetoes a write outside the availability window', () => {
    const kernel = makeKernel()
    const result = kernel.write({
      kind: 'add',
      event: {
        id: 'e1',
        title: 'Late',
        start: '2026-01-05T18:00:00',
        end: '2026-01-05T19:00:00',
        resources: ['r1'],
      },
    })

    expect(result.status).toBe('rejected')
    if (result.status === 'rejected') {
      expect(result.conflicts[0]!.code).toBe('availability/outside-hours')
    }
    expect(kernel.getEvents()).toHaveLength(0)
  })

  it('ignores events without resources', () => {
    const kernel = makeKernel()
    const result = kernel.write({
      kind: 'add',
      event: {
        id: 'e1',
        title: 'No resource',
        start: '2026-01-05T18:00:00',
        end: '2026-01-05T19:00:00',
      },
    })

    expect(result.status).toBe('committed')
  })
})
