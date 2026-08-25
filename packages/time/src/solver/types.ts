import type { Temporal } from '@js-temporal/polyfill'
import type { WorkingTimeConfig } from '~/validation/availability'
import type { SchedulingConstraint } from '~/validation/constraints'
import type { DependencyType } from '~/validation/dependency'
import type { DurationResourceInput } from '~/validation/duration'

export interface SolveEvent {
  id: string
  start: string
  end: string
  manuallyScheduled?: boolean
  constraint?: SchedulingConstraint
  calendarId?: string
  resources?: Array<DurationResourceInput>
  duration?: number
}

export interface SolveDependency {
  predecessorId: string
  successorId: string
  type: DependencyType
  lag?: number
}

export interface SolveRequest {
  events: Array<SolveEvent>
  dependencies: Array<SolveDependency>
  anchors?: Array<string>
  timeZone: Temporal.TimeZoneLike
  workingTime?: WorkingTimeConfig
  direction?: 'ASAP' | 'ALAP'
}

export interface SolveConflict {
  code: 'cycle' | 'unsatisfiable'
  eventIds: Array<string>
  message: string
}

export interface SolveResult {
  events: Array<SolveEvent>
  conflicts: Array<SolveConflict>
}
