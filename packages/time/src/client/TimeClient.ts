import { EventClient } from '@tanstack/devtools-event-client'
import type {
  AvailabilityConflict,
  UnavailabilityReason,
} from '../calendar/types'

/**
 * Event map for TimeClient events
 */
export interface TimeEventMap {
  'time:event:added': {
    eventId: string
    eventTitle: string
    start: string
    end: string
  }
  'time:event:updated': {
    eventId: string
    eventTitle: string
    start: string
    end: string
    updates: Record<string, unknown>
  }
  'time:event:removed': {
    eventId: string
    eventTitle: string
    start: string
    end: string
  }
  'time:event:resized': {
    eventId: string
    eventTitle: string
    start: string
    end: string
  }
  'time:event:update:error': {
    eventId: string
    eventTitle: string
    reason: 'unavailable-time' | 'invalid-time' | 'min-duration' | 'blocked'
    message: string
    originalStart: string
    originalEnd: string
    attemptedStart?: string
    attemptedEnd?: string
    conflicts?: Array<AvailabilityConflict>
  }
  'time:calendar:navigate': {
    direction: 'previous' | 'next' | 'current' | 'specific'
    targetDate: string
  }
  'time:calendar:viewMode:changed': {
    viewMode: {
      value: number
      unit: string
    }
  }
}

/**
 * TimeClient extends EventClient to provide typed events for calendar operations
 * Used by devtools to monitor and display activity
 */
class TimeClient extends EventClient<TimeEventMap> {
  private static instance: TimeClient | null = null

  private constructor() {
    super({
      pluginId: 'time',
    })
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): TimeClient {
    if (!TimeClient.instance) {
      TimeClient.instance = new TimeClient()
    }
    return TimeClient.instance
  }
}

/**
 * Get the global TimeClient instance
 */
export function getTimeClient(): TimeClient {
  return TimeClient.getInstance()
}

export type { AvailabilityConflict, UnavailabilityReason }
