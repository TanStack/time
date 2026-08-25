import { Temporal } from '@js-temporal/polyfill'
import {
  applyMultiResourcePolicy,
  formatMinutesToTime,
  MINUTES_IN_DAY,
  resourceDayWorkingTime,
  type WorkingTimeConfig,
} from './time'

export interface AvailabilityResourceInput {
  id: string
  label: string
  calendarId?: string
  capacity?: Array<number>
}

export interface AvailabilityTargetEvent {
  id: string
  title: string
  start: string
  end: string
  calendarId?: string
}

export interface AvailabilityOtherEvent {
  id: string
  start: string
  end: string
  resourceIds: Array<string>
  consumption?: Array<number>
  masterId?: string
}

export interface CheckAvailabilityInput {
  event: AvailabilityTargetEvent
  resources: Array<AvailabilityResourceInput>
  workingTime: WorkingTimeConfig
  consumption?: Array<number>
  otherEvents?: Array<AvailabilityOtherEvent>
}

export interface AvailabilityUnavailabilityReason {
  resourceId: string
  resourceLabel: string
  reason: 'outside-hours' | 'capacity' | 'no-calendar'
  description: string
  capacityInfo?: {
    max: number
    used: number
    remaining: number
  }
}

export interface AvailabilityConflict {
  date: string
  conflictRange: {
    start: string
    end: string
  }
  resourceIds: Array<string>
  resourceDetails: Array<AvailabilityUnavailabilityReason>
  description: string
}

export function getUnavailabilityDetails(
  resources: Array<AvailabilityResourceInput>,
  date: string,
  startMinutes: number,
  endMinutes: number,
  workingTime: WorkingTimeConfig,
  eventCalendarId?: string,
): Array<AvailabilityUnavailabilityReason> {
  if (resources.length === 0) return []

  const details: Array<AvailabilityUnavailabilityReason> = []

  for (const resource of resources) {
    const { working: availableSlots, configured } = resourceDayWorkingTime(
      resource,
      date,
      workingTime,
      eventCalendarId,
    )

    if (!configured) {
      details.push({
        resourceId: resource.id,
        resourceLabel: resource.label,
        reason: 'no-calendar',
        description: `${resource.label}: No working calendar configured`,
      })
      continue
    }

    if (availableSlots.length === 0) {
      details.push({
        resourceId: resource.id,
        resourceLabel: resource.label,
        reason: 'outside-hours',
        description: `${resource.label}: Not available on this day`,
      })
      continue
    }

    let isWithinAvailability = false
    for (const slot of availableSlots) {
      if (startMinutes >= slot.startMinutes && endMinutes <= slot.endMinutes) {
        isWithinAvailability = true
        break
      }
    }

    if (!isWithinAvailability) {
      let availabilityWindow = ''
      for (let i = 0; i < availableSlots.length; i++) {
        const r = availableSlots[i]!
        if (i > 0) availabilityWindow += ', '
        availabilityWindow += `${formatMinutesToTime(r.startMinutes)}-${formatMinutesToTime(r.endMinutes)}`
      }

      details.push({
        resourceId: resource.id,
        resourceLabel: resource.label,
        reason: 'outside-hours',
        description: `${resource.label}: Available ${availabilityWindow}, but event is ${formatMinutesToTime(startMinutes)}-${formatMinutesToTime(endMinutes)}`,
      })
    }
  }

  return applyMultiResourcePolicy(details, resources.length, workingTime)
}

export function checkAvailability(input: CheckAvailabilityInput): Array<AvailabilityConflict> {
  const { event, resources, otherEvents = [] } = input
  if (resources.length === 0) return []

  const resourceIds = resources.map((r) => r.id)
  const startDt = Temporal.PlainDateTime.from(event.start)
  const endDt = Temporal.PlainDateTime.from(event.end)
  const startDate = startDt.toPlainDate()
  const endDate = endDt.toPlainDate()
  let cursorDate = startDate

  const eventConsumptionArr = input.consumption ?? [1]
  const eventConsumptionSum = eventConsumptionArr.reduce((a, b) => a + b, 0)

  while (Temporal.PlainDate.compare(cursorDate, endDate) <= 0) {
    const dayStr = cursorDate.toString({ calendarName: 'never' })
    const isSameAsStart = Temporal.PlainDate.compare(cursorDate, startDate) === 0
    const isSameAsEnd = Temporal.PlainDate.compare(cursorDate, endDate) === 0

    const overlapStartMins = isSameAsStart ? startDt.hour * 60 + startDt.minute : 0
    let overlapEndMins: number
    if (isSameAsEnd) {
      const endMins = endDt.hour * 60 + endDt.minute
      overlapEndMins = endMins === 0 && !isSameAsStart ? 0 : endMins || MINUTES_IN_DAY
    } else {
      overlapEndMins = MINUTES_IN_DAY
    }

    if (overlapStartMins < overlapEndMins) {
      const details = getUnavailabilityDetails(
        resources,
        dayStr,
        overlapStartMins,
        overlapEndMins,
        input.workingTime,
        event.calendarId,
      )

      if (details.length > 0) {
        return [
          {
            date: dayStr,
            conflictRange: {
              start: formatMinutesToTime(overlapStartMins),
              end: formatMinutesToTime(overlapEndMins),
            },
            resourceIds,
            resourceDetails: details.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: `"${event.title}": ${d.description}`,
            })),
            description: `"${event.title}" would be pushed to unavailable time: ${details.map((d) => d.description).join('; ')}`,
          },
        ]
      }

      const eventsOnDay = otherEvents.filter((candidate) => {
        const cStart = Temporal.PlainDateTime.from(candidate.start).toPlainDate()
        const cEnd = Temporal.PlainDateTime.from(candidate.end).toPlainDate()
        return (
          Temporal.PlainDate.compare(cursorDate, cStart) >= 0 &&
          Temporal.PlainDate.compare(cursorDate, cEnd) <= 0
        )
      })

      for (const resource of resources) {
        if (!resource.capacity || resource.capacity.length === 0) continue
        const capacitySum = resource.capacity.reduce((a, b) => a + b, 0)
        if (capacitySum <= 0) continue

        const overlappingEvents = eventsOnDay.filter((e) => {
          const masterId = e.masterId ?? e.id
          if (e.id === event.id || masterId === event.id) return false
          if (!e.resourceIds.includes(resource.id)) return false

          const eStartDt = Temporal.PlainDateTime.from(e.start)
          const eEndDt = Temporal.PlainDateTime.from(e.end)
          const eStartDate = eStartDt.toPlainDate()
          const eEndDate = eEndDt.toPlainDate()
          const cursorIsStart = Temporal.PlainDate.compare(cursorDate, eStartDate) === 0
          const cursorIsEnd = Temporal.PlainDate.compare(cursorDate, eEndDate) === 0
          const cursorAfterStart = Temporal.PlainDate.compare(cursorDate, eStartDate) >= 0
          const cursorBeforeEnd = Temporal.PlainDate.compare(cursorDate, eEndDate) <= 0
          if (!cursorAfterStart || !cursorBeforeEnd) return false

          const eStartMins = cursorIsStart ? eStartDt.hour * 60 + eStartDt.minute : 0
          let eEndMins: number
          if (cursorIsEnd) {
            const m = eEndDt.hour * 60 + eEndDt.minute
            eEndMins = m === 0 && !cursorIsStart ? 0 : m || MINUTES_IN_DAY
          } else {
            eEndMins = MINUTES_IN_DAY
          }

          return overlapStartMins < eEndMins && overlapEndMins > eStartMins
        })

        const seen = new Set<string>()
        let usedByOthers = 0
        for (const oe of overlappingEvents) {
          if (seen.has(oe.id)) continue
          seen.add(oe.id)
          const c = oe.consumption ?? [1]
          usedByOthers += c.reduce((a, b) => a + b, 0)
        }

        const totalUsage = usedByOthers + eventConsumptionSum
        if (totalUsage > capacitySum) {
          return [
            {
              date: dayStr,
              conflictRange: {
                start: formatMinutesToTime(overlapStartMins),
                end: formatMinutesToTime(overlapEndMins),
              },
              resourceIds: [resource.id],
              resourceDetails: [
                {
                  resourceId: resource.id,
                  resourceLabel: resource.label,
                  reason: 'capacity',
                  description: `"${event.title}": ${resource.label} capacity exceeded (${totalUsage}/${capacitySum} units used)`,
                  capacityInfo: {
                    max: capacitySum,
                    used: totalUsage,
                    remaining: Math.max(0, capacitySum - usedByOthers),
                  },
                },
              ],
              description: `"${event.title}" exceeds ${resource.label} capacity (${totalUsage}/${capacitySum})`,
            },
          ]
        }
      }
    }

    cursorDate = cursorDate.add({ days: 1 })
  }

  return []
}
