import type { WorkingCalendar, WorkingTimeRange } from '~/workingTime'

export interface SlotRule {
  id: string
  calendarId: string
  duration: number
  step?: number
  bufferBefore?: number
  bufferAfter?: number
  minNotice?: number
  minNoticeIsWorkingTime?: boolean
  maxHorizon?: number
  resourceIds?: Array<string>
  capacity?: number
}

export interface SlotResource {
  id: string
  capacity?: Array<number>
  buffer?: {
    before?: number
    after?: number
  }
}

export interface SlotOccupyingEvent {
  id: string
  start: string
  end: string
  resourceIds?: Array<string>
  consumption?: Array<number>
  expiresAt?: string
}

export interface Slot {
  ruleId: string
  start: string
  end: string
  startEpochMs: number
  endEpochMs: number
  availableResourceIds: Array<string>
  remainingCapacity: number
}

export interface GenerateSlotsInput {
  rules: Array<SlotRule>
  range: WorkingTimeRange
  now: string
  timeZone: string
  calendars?: Array<WorkingCalendar> | null
  resources?: Array<SlotResource> | null
  events?: Array<SlotOccupyingEvent> | null
  maxSlots?: number
}

export interface GenerateSlotsResult {
  slots: Array<Slot>
  requiredRange: WorkingTimeRange
  truncated: boolean
}
