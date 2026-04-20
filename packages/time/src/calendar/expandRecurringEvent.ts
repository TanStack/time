import { Temporal } from '@js-temporal/polyfill'
import type { Event, Resource } from './types'

/**
 * Expand a single recurring master event into individual occurrence instances
 * that fall within the given viewport window [windowStart, windowEnd).
 *
 * Design contract:
 * - The master event itself (occurrence index 0) is **not** returned here —
 *   it is already placed by the normal path in getEventMap().
 * - Every generated occurrence gets a stable synthetic id: `"{masterId}_{n}"`
 *   where n ≥ 1.
 * - Each occurrence carries `_recurringMasterId` and `_occurrenceIndex` so
 *   the UI can identify them.
 * - Occurrences are ephemeral: they are never stored in `_eventMap` and will
 *   never be passed to updateEvent/removeEvent.
 *
 * @param event       The master recurring event (already normalised, start/end are ISO strings).
 * @param windowStart ISO date string (YYYY-MM-DD) — inclusive lower bound.
 * @param windowEnd   ISO date string (YYYY-MM-DD) — exclusive upper bound.
 */
export function expandRecurringEvent<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(event: TEvent, windowStart: string, windowEnd: string): Array<TEvent> {
  const rule = (event as Event<TResource>).recurrence
  if (!rule) return []

  const masterStartStr = event.start as string
  const masterEndStr = event.end as string

  const masterStart = Temporal.PlainDateTime.from(masterStartStr)
  const masterEnd = Temporal.PlainDateTime.from(masterEndStr)

  // Duration of a single occurrence
  const durationMs = masterStart
    .toZonedDateTime('UTC')
    .until(masterEnd.toZonedDateTime('UTC'))
    .total('milliseconds')

  const interval = rule.interval ?? 1
  const windowStartDate = Temporal.PlainDate.from(windowStart)
  const windowEndDate = Temporal.PlainDate.from(windowEnd)

  // Hard ceiling from rule.until
  const untilDate = rule.until ? Temporal.PlainDate.from(rule.until) : null

  const frequency = rule.frequency

  // For weekly byWeekday: which ISO weekdays to fire on.
  // Default: the master start's weekday.
  const byWeekday =
    frequency === 'weekly' && rule.byWeekday?.length
      ? rule.byWeekday
      : frequency === 'weekly'
        ? [masterStart.dayOfWeek]
        : null

  const occurrences: Array<TEvent> = []
  let occurrenceIndex = 1 // 0 is the master, already placed

  // We generate candidate start dates by stepping from the master date.
  // We begin at step=1 (one interval ahead) — step=0 === master.
  let step = 1
  const MAX_STEPS = 3650 // safety guard

  while (step <= MAX_STEPS) {
    let candidateStart: Temporal.PlainDateTime

    switch (frequency) {
      case 'daily':
        candidateStart = masterStart.add({ days: step * interval })
        break
      case 'weekly': {
        if (byWeekday) {
          // For weekly+byWeekday we enumerate individual weekday hits.
          const weekNum = Math.floor((step - 1) / byWeekday.length) + 1
          const dayIdx = (step - 1) % byWeekday.length
          const targetWeekday = byWeekday[dayIdx]!

          const masterMonday = masterStart
            .toPlainDate()
            .subtract({ days: masterStart.dayOfWeek - 1 })
          const targetMonday = masterMonday.add({ weeks: weekNum * interval })
          const targetDate = targetMonday.add({ days: targetWeekday - 1 })

          candidateStart = Temporal.PlainDateTime.from({
            year: targetDate.year,
            month: targetDate.month,
            day: targetDate.day,
            hour: masterStart.hour,
            minute: masterStart.minute,
            second: masterStart.second,
          })
        } else {
          candidateStart = masterStart.add({ weeks: step * interval })
        }
        break
      }
      case 'monthly':
        candidateStart = addSafeMonths(masterStart, step * interval)
        break
      case 'yearly':
        candidateStart = addSafeMonths(masterStart, step * interval * 12)
        break
      default:
        // Exhaustive guard — TypeScript narrows `frequency` to `never` here.
        candidateStart = masterStart.add({ days: step * interval })
        break
    }

    const candidateDate = candidateStart.toPlainDate()

    // Past rule.until → stop entirely
    if (
      untilDate &&
      Temporal.PlainDate.compare(candidateDate, untilDate) >= 0
    ) {
      break
    }

    // Past window end → stop (occurrences are generated in order)
    if (Temporal.PlainDate.compare(candidateDate, windowEndDate) >= 0) {
      break
    }

    // Past count limit → stop
    if (rule.count !== undefined && occurrenceIndex >= rule.count) {
      break
    }

    // Within window: emit
    if (Temporal.PlainDate.compare(candidateDate, windowStartDate) >= 0) {
      const candidateEnd = candidateStart
        .toZonedDateTime('UTC')
        .add({ milliseconds: durationMs })
        .toPlainDateTime()

      occurrences.push({
        ...event,
        id: `${event.id}_${occurrenceIndex}`,
        start: candidateStart.toString({ smallestUnit: 'second' }),
        end: candidateEnd.toString({ smallestUnit: 'second' }),
        _recurringMasterId: event.id,
        _occurrenceIndex: occurrenceIndex,
        // Strip master-only bookkeeping fields from occurrences
        _originalStart: undefined,
        _originalEnd: undefined,
      })
      occurrenceIndex++
    }

    step++
  }

  return occurrences
}

/**
 * Add N months to a PlainDateTime, clamping the day-of-month to the last valid
 * day of the resulting month (e.g. Jan 31 + 1 month → Feb 28/29).
 */
function addSafeMonths(
  dt: Temporal.PlainDateTime,
  months: number,
): Temporal.PlainDateTime {
  let year = dt.year
  let month = dt.month + months

  // Normalise month overflow
  year += Math.floor((month - 1) / 12)
  month = ((month - 1) % 12) + 1

  // Clamp day to last valid day in target month
  const daysInMonth = Temporal.PlainDate.from({
    year,
    month,
    day: 1,
  }).daysInMonth
  const day = Math.min(dt.day, daysInMonth)

  return Temporal.PlainDateTime.from({
    year,
    month,
    day,
    hour: dt.hour,
    minute: dt.minute,
    second: dt.second,
  })
}
