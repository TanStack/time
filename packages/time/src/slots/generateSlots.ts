import { Temporal } from '@js-temporal/polyfill'
import {
  addWorkingMinutes,
  formatMinutesToTime,
  getLayeredWorkingTime,
  MINUTES_IN_DAY,
  parseHmToMinutes,
  resolveCalendarTimeZone,
} from '~/workingTime'
import type { WorkingTimeRange } from '~/workingTime'
import type {
  GenerateSlotsInput,
  GenerateSlotsResult,
  Slot,
  SlotOccupyingEvent,
  SlotResource,
  SlotRule,
} from './types'

export const DEFAULT_MAX_SLOTS = 5_000

const MS_PER_MINUTE = 60_000
const MS_PER_DAY = 86_400_000

function minutesOfDay(value: string): number {
  return value.length < 16 ? 0 : parseHmToMinutes(value.slice(11, 16))
}

function civilMinutes(value: string): number {
  const year = +value.slice(0, 4)
  const month = +value.slice(5, 7)
  const day = +value.slice(8, 10)
  return Date.UTC(year, month - 1, day) / MS_PER_MINUTE + minutesOfDay(value)
}

function civilStamp(totalMinutes: number): string {
  const dayIndex = Math.floor(totalMinutes / MINUTES_IN_DAY)
  const withinDay = totalMinutes - dayIndex * MINUTES_IN_DAY
  const date = new Date(dayIndex * MS_PER_DAY).toISOString().slice(0, 10)
  return `${date}T${formatMinutesToTime(withinDay)}:00`
}

function openingScanStart(lowerBound: number): number {
  const startOfDay = lowerBound - (lowerBound % MINUTES_IN_DAY)
  return startOfDay - MINUTES_IN_DAY
}

function sum(values: Array<number>): number {
  return values.reduce((total, value) => total + value, 0)
}

export function resolveSlotInstants(civil: string, timeZone: string): Array<number> {
  const plain = Temporal.PlainDateTime.from(civil)
  const earlier = plain.toZonedDateTime(timeZone, { disambiguation: 'earlier' })
  if (!earlier.toPlainDateTime().equals(plain)) return []

  const later = plain.toZonedDateTime(timeZone, { disambiguation: 'later' })
  return earlier.epochMilliseconds === later.epochMilliseconds
    ? [earlier.epochMilliseconds]
    : [earlier.epochMilliseconds, later.epochMilliseconds]
}

interface Occupant {
  startMinutes: number
  endMinutes: number
  resourceIds: Array<string>
  consumption: number
}

function toOccupants(events: Array<SlotOccupyingEvent>, now: string): Array<Occupant> {
  const nowMinutes = civilMinutes(now)

  return events
    .filter((event) => event.expiresAt === undefined || civilMinutes(event.expiresAt) > nowMinutes)
    .map((event) => ({
      startMinutes: civilMinutes(event.start),
      endMinutes: civilMinutes(event.end),
      resourceIds: event.resourceIds ?? [],
      consumption: sum(event.consumption ?? [1]),
    }))
}

function reservedOverlap(
  slotStart: number,
  slotEnd: number,
  occupant: Occupant,
  before: number,
  after: number,
): boolean {
  return (
    slotStart - before < occupant.endMinutes + after &&
    slotEnd + after > occupant.startMinutes - before
  )
}

function lowerBoundFor(
  rule: SlotRule,
  input: GenerateSlotsInput,
  layers: Array<Array<string | undefined>>,
): number {
  const rangeStart = civilMinutes(input.range.start)
  const nowMinutes = civilMinutes(input.now)

  if (!rule.minNotice) return Math.max(rangeStart, nowMinutes)

  const earliest = rule.minNoticeIsWorkingTime
    ? addWorkingMinutes(input.now, rule.minNotice, layers, input.calendars)
    : civilStamp(nowMinutes + rule.minNotice)

  return Math.max(rangeStart, earliest === null ? Infinity : civilMinutes(earliest))
}

function upperBoundFor(rule: SlotRule, input: GenerateSlotsInput): number {
  const rangeEnd = civilMinutes(input.range.end)
  if (rule.maxHorizon === undefined) return rangeEnd

  const startOfToday = civilMinutes(`${input.now.slice(0, 10)}T00:00:00`)
  return Math.min(rangeEnd, startOfToday + (rule.maxHorizon + 1) * MINUTES_IN_DAY)
}

function candidatesFor(rule: SlotRule, resources: Array<SlotResource>): Array<SlotResource> | null {
  if (!rule.resourceIds) return null
  return rule.resourceIds.map((id) => resources.find((resource) => resource.id === id) ?? { id })
}

function occupancyFor(
  rule: SlotRule,
  candidates: Array<SlotResource> | null,
  occupants: Array<Occupant>,
  slotStart: number,
  slotEnd: number,
): { availableResourceIds: Array<string>; remainingCapacity: number } | null {
  if (candidates === null) {
    const before = rule.bufferBefore ?? 0
    const after = rule.bufferAfter ?? 0
    const capacity = rule.capacity ?? 1
    const used = occupants
      .filter((occupant) => reservedOverlap(slotStart, slotEnd, occupant, before, after))
      .reduce((total, occupant) => total + occupant.consumption, 0)

    return used >= capacity
      ? null
      : { availableResourceIds: [], remainingCapacity: capacity - used }
  }

  const availableResourceIds: Array<string> = []
  let remainingCapacity = 0

  for (const resource of candidates) {
    const before = Math.max(rule.bufferBefore ?? 0, resource.buffer?.before ?? 0)
    const after = Math.max(rule.bufferAfter ?? 0, resource.buffer?.after ?? 0)
    const capacity = sum(resource.capacity ?? [1])

    const used = occupants
      .filter((occupant) => occupant.resourceIds.includes(resource.id))
      .filter((occupant) => reservedOverlap(slotStart, slotEnd, occupant, before, after))
      .reduce((total, occupant) => total + occupant.consumption, 0)

    if (used + 1 > capacity) continue

    availableResourceIds.push(resource.id)
    remainingCapacity += capacity - used
  }

  return availableResourceIds.length === 0 ? null : { availableResourceIds, remainingCapacity }
}

function maxBufferOf(rule: SlotRule, candidates: Array<SlotResource> | null): number {
  const own = Math.max(rule.bufferBefore ?? 0, rule.bufferAfter ?? 0)
  if (candidates === null) return own

  return candidates.reduce(
    (largest, resource) =>
      Math.max(largest, resource.buffer?.before ?? 0, resource.buffer?.after ?? 0),
    own,
  )
}

export function generateSlots(input: GenerateSlotsInput): GenerateSlotsResult {
  const maxSlots = input.maxSlots ?? DEFAULT_MAX_SLOTS
  const resources = input.resources ?? []
  const occupants = toOccupants(input.events ?? [], input.now)

  const slots: Array<Slot> = []
  let truncated = false
  let requiredStart = Infinity
  let requiredEnd = -Infinity

  for (const rule of input.rules) {
    if (rule.duration <= 0) throw new Error(`Slot rule "${rule.id}": duration must be positive`)

    const step = rule.step ?? rule.duration
    if (step <= 0) throw new Error(`Slot rule "${rule.id}": step must be positive`)

    const layers = [[rule.calendarId]]
    const lowerBound = lowerBoundFor(rule, input, layers)
    const upperBound = upperBoundFor(rule, input)
    if (!Number.isFinite(lowerBound) || upperBound <= lowerBound) continue

    const candidates = candidatesFor(rule, resources)
    const padding = maxBufferOf(rule, candidates)
    requiredStart = Math.min(requiredStart, lowerBound - padding)
    requiredEnd = Math.max(requiredEnd, upperBound + padding)

    const timeZone = resolveCalendarTimeZone(rule.calendarId, input.calendars) ?? input.timeZone

    const openings = getLayeredWorkingTime(
      layers,
      { start: civilStamp(openingScanStart(lowerBound)), end: civilStamp(upperBound) },
      input.calendars,
    )

    for (const opening of openings) {
      const openingStart = civilMinutes(opening.start)
      const openingEnd = civilMinutes(opening.end)

      for (
        let slotStart = openingStart;
        slotStart + rule.duration <= openingEnd;
        slotStart += step
      ) {
        const slotEnd = slotStart + rule.duration
        if (slotStart < lowerBound || slotEnd > upperBound) continue

        const occupancy = occupancyFor(rule, candidates, occupants, slotStart, slotEnd)
        if (occupancy === null) continue

        const start = civilStamp(slotStart)
        for (const startEpochMs of resolveSlotInstants(start, timeZone)) {
          if (slots.length >= maxSlots) {
            truncated = true
            break
          }

          slots.push({
            ruleId: rule.id,
            start,
            end: civilStamp(slotEnd),
            startEpochMs,
            endEpochMs: startEpochMs + rule.duration * MS_PER_MINUTE,
            availableResourceIds: occupancy.availableResourceIds,
            remainingCapacity: occupancy.remainingCapacity,
          })
        }

        if (truncated) break
      }

      if (truncated) break
    }

    if (truncated) break
  }

  slots.sort(
    (a, b) =>
      a.startEpochMs - b.startEpochMs || (a.ruleId < b.ruleId ? -1 : a.ruleId > b.ruleId ? 1 : 0),
  )

  const requiredRange: WorkingTimeRange =
    requiredStart === Infinity
      ? { start: input.range.start, end: input.range.end }
      : { start: civilStamp(requiredStart), end: civilStamp(requiredEnd) }

  return { slots, requiredRange, truncated }
}
