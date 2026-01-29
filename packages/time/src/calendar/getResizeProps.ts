import { Temporal } from '@js-temporal/polyfill'

export type ResizeEdge = 'top' | 'bottom'

export interface ResizeConstraints {
  minDurationMinutes?: number
  snapToMinutes?: number
}

interface CalculateResizedEventOptions {
  originalStart: string
  originalEnd: string
  edge: ResizeEdge
  deltaMinutes: number
  timeZone: Temporal.TimeZoneLike
  constraints?: ResizeConstraints
}

interface ResizedEventResult {
  start: string
  end: string
  durationMinutes: number
}

const DEFAULT_MIN_DURATION_MINUTES = 15
const DEFAULT_SNAP_TO_MINUTES = 15

const roundToNearestInterval = (minutes: number, interval: number): number =>
  Math.round(minutes / interval) * interval

export function calculateResizedEvent(
  options: CalculateResizedEventOptions,
): ResizedEventResult {
  const {
    originalStart,
    originalEnd,
    edge,
    deltaMinutes,
    timeZone,
    constraints = {},
  } = options

  const {
    minDurationMinutes = DEFAULT_MIN_DURATION_MINUTES,
    snapToMinutes = DEFAULT_SNAP_TO_MINUTES,
  } = constraints

  const startZdt =
    Temporal.PlainDateTime.from(originalStart).toZonedDateTime(timeZone)
  const endZdt =
    Temporal.PlainDateTime.from(originalEnd).toZonedDateTime(timeZone)

  const snappedDelta = roundToNearestInterval(deltaMinutes, snapToMinutes)

  let newStartZdt = startZdt
  let newEndZdt = endZdt

  if (edge === 'top') {
    newStartZdt = startZdt.add({ minutes: snappedDelta })
    const maxStartZdt = endZdt.subtract({ minutes: minDurationMinutes })
    if (Temporal.ZonedDateTime.compare(newStartZdt, maxStartZdt) > 0) {
      newStartZdt = maxStartZdt
    }
  } else {
    newEndZdt = endZdt.add({ minutes: snappedDelta })
    const minEndZdt = startZdt.add({ minutes: minDurationMinutes })
    if (Temporal.ZonedDateTime.compare(newEndZdt, minEndZdt) < 0) {
      newEndZdt = minEndZdt
    }
  }

  const durationMs = newEndZdt.epochMilliseconds - newStartZdt.epochMilliseconds
  const durationMinutes = Math.floor(durationMs / (1000 * 60))

  return {
    start: newStartZdt.toPlainDateTime().toString(),
    end: newEndZdt.toPlainDateTime().toString(),
    durationMinutes,
  }
}

export function calculateDeltaMinutesFromPixels(
  deltaPixels: number,
  containerHeight: number,
  minutesInDay: number = 24 * 60,
): number {
  return (deltaPixels / containerHeight) * minutesInDay
}

export interface ResizeHandleStyle {
  position: 'absolute'
  left: number
  right: number
  height: string
  cursor: 'ns-resize'
  zIndex: number
  top?: number
  bottom?: number
}

export function getResizeHandleStyle(edge: ResizeEdge): ResizeHandleStyle {
  const baseStyle: ResizeHandleStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '8px',
    cursor: 'ns-resize',
    zIndex: 10,
  }

  if (edge === 'top') {
    return { ...baseStyle, top: 0 }
  }
  return { ...baseStyle, bottom: 0 }
}
