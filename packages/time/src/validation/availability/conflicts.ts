import { formatMinutesToTime } from './time'
import type { AvailabilityConflict, AvailabilityUnavailabilityReason } from './checkAvailability'

interface UnavailabilityConflictInput {
  date: string
  startMinutes: number
  endMinutes: number
  details: Array<AvailabilityUnavailabilityReason>
}

export function describeUnavailability(details: Array<AvailabilityUnavailabilityReason>): string {
  return details.map((detail) => `${detail.resourceLabel} (${detail.reason})`).join(', ')
}

export function toUnavailabilityConflict(input: UnavailabilityConflictInput): AvailabilityConflict {
  const { date, startMinutes, endMinutes, details } = input

  return {
    date,
    conflictRange: {
      start: formatMinutesToTime(startMinutes),
      end: formatMinutesToTime(endMinutes),
    },
    resourceIds: details.map((detail) => detail.resourceId),
    resourceDetails: details.map((detail) => ({
      resourceId: detail.resourceId,
      resourceLabel: detail.resourceLabel,
      reason: detail.reason,
      description: detail.description,
    })),
    description: details.map((detail) => detail.description).join('; '),
  }
}
