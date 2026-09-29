import { Temporal } from '@js-temporal/polyfill'
import { toPlainDateTimeString } from '~/date/parse'
import { generateSlots } from '~/slots'
import { resolveCalendarTimeZone } from '~/workingTime'
import type { Conflict, KernelEvent } from '~/kernel'
import type { GenerateSlotsResult, Slot, SlotResource, SlotRule } from '~/slots'
import type { Event, EventDateTimeInput, Resource } from '../types'
import type { CalendarFeature, CalendarHost } from './types'
import type { WorkingTimeApi } from './workingTime'

export interface BookingSlot {
  ruleId: string
  start: Date
  end: Date
  availableResourceIds: Array<string>
  remainingCapacity: number
}

export interface BookingRange {
  start: Date
  end: Date
}

export interface GetSlotsOptions<TResource extends Resource> {
  start: EventDateTimeInput
  end: EventDateTimeInput
  now?: EventDateTimeInput
  ruleIds?: Array<string>
  resourceIds?: Array<TResource['id']>
  maxSlots?: number
}

export interface GetSlotsResult {
  slots: Array<BookingSlot>
  requiredRange: BookingRange
  unbackedRanges: Array<BookingRange>
  truncated: boolean
}

export interface BookingPayload<TResource extends Resource> {
  id: string
  title: string
  resourceId?: TResource['id']
  consumption?: Array<number>
  expiresAt?: EventDateTimeInput
}

export type BookingResult<TEvent> =
  | { success: true; event: TEvent }
  | { success: false; conflicts: Array<Conflict> }

export interface BookingApi<TResource extends Resource, TEvent extends Event<TResource>> {
  getSlotRules: () => Array<SlotRule>
  getSlots: (options: GetSlotsOptions<TResource>) => GetSlotsResult
  book: (slot: BookingSlot, payload: BookingPayload<TResource>) => BookingResult<TEvent>
  hold: (
    slot: BookingSlot,
    payload: BookingPayload<TResource> & { expiresAt: EventDateTimeInput },
  ) => BookingResult<TEvent>
}

export interface BookingPeers<TResource extends Resource> {
  workingTime: WorkingTimeApi<TResource>
}

const NO_RULES: Array<SlotRule> = []

export function bookingFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  object,
  BookingApi<TResource, TEvent>,
  'booking',
  BookingPeers<TResource>
> {
  const timeZoneOf = (host: CalendarHost<TResource, TEvent>): string =>
    String(host.getOptions().timeZone)

  const toCivil = (value: Date, timeZone: string): string =>
    Temporal.Instant.fromEpochMilliseconds(value.getTime())
      .toZonedDateTimeISO(timeZone)
      .toPlainDateTime()
      .toString({ calendarName: 'never' })

  const slotResourcesOf = (host: CalendarHost<TResource, TEvent>): Array<SlotResource> =>
    (host.getOptions().resources ?? []).map((resource) => ({
      id: resource.id,
      capacity: resource.capacity,
      buffer: resource.buffer,
    }))

  const expiryOf = (event: TEvent): string | undefined => {
    const expiresAt = (event as { expiresAt?: EventDateTimeInput }).expiresAt
    return expiresAt === undefined ? undefined : toPlainDateTimeString(expiresAt)
  }

  const occupyingEventsOf = (host: CalendarHost<TResource, TEvent>) =>
    host.getEvents().map((event) => ({
      id: event.id,
      start: toPlainDateTimeString(event.start),
      end: toPlainDateTimeString(event.end),
      resourceIds: (event.resources ?? []).map((resource) =>
        typeof resource === 'string' ? resource : resource.id,
      ),
      consumption: event.consumption,
      expiresAt: expiryOf(event),
    }))

  const rulesOf = (
    host: CalendarHost<TResource, TEvent>,
    ruleIds?: Array<string>,
  ): Array<SlotRule> => {
    const rules = host.getOptions().slotRules ?? NO_RULES
    return ruleIds ? rules.filter((rule) => ruleIds.includes(rule.id)) : rules
  }

  const scopeToResources = (
    rules: Array<SlotRule>,
    resourceIds?: Array<string>,
  ): Array<SlotRule> => {
    if (!resourceIds) return rules

    return rules.flatMap((rule) => {
      if (!rule.resourceIds) return [rule]
      const scoped = rule.resourceIds.filter((id) => resourceIds.includes(id))
      return scoped.length === 0 ? [] : [{ ...rule, resourceIds: scoped }]
    })
  }

  const unbackedRangesOf = (
    host: CalendarHost<TResource, TEvent>,
    required: GenerateSlotsResult['requiredRange'],
  ): Array<{ start: string; end: string }> => {
    const loaded = host.getLoadedRanges()
    if (loaded === null) return []

    const gaps: Array<{ start: string; end: string }> = []
    let cursor = required.start

    for (const range of [...loaded].sort((a, b) => (a.start < b.start ? -1 : 1))) {
      if (range.end <= cursor) continue
      if (range.start >= required.end) break
      if (range.start > cursor) gaps.push({ start: cursor, end: range.start })
      cursor = range.end > cursor ? range.end : cursor
      if (cursor >= required.end) break
    }

    if (cursor < required.end) gaps.push({ start: cursor, end: required.end })
    return gaps
  }

  const toBookingRange = (
    range: { start: string; end: string },
    timeZone: string,
  ): BookingRange => ({
    start: new Date(
      Temporal.PlainDateTime.from(range.start).toZonedDateTime(timeZone).epochMilliseconds,
    ),
    end: new Date(
      Temporal.PlainDateTime.from(range.end).toZonedDateTime(timeZone).epochMilliseconds,
    ),
  })

  const toBookingSlot = (slot: Slot): BookingSlot => ({
    ruleId: slot.ruleId,
    start: new Date(slot.startEpochMs),
    end: new Date(slot.endEpochMs),
    availableResourceIds: slot.availableResourceIds,
    remainingCapacity: slot.remainingCapacity,
  })

  const write = (
    host: CalendarHost<TResource, TEvent>,
    slot: BookingSlot,
    payload: BookingPayload<TResource>,
    reason: string,
  ): BookingResult<TEvent> => {
    const rule = rulesOf(host).find((candidate) => candidate.id === slot.ruleId)
    const timeZone =
      resolveCalendarTimeZone(rule?.calendarId, host.getOptions().workingTime.calendars) ??
      timeZoneOf(host)

    const resourceId = payload.resourceId ?? slot.availableResourceIds[0]
    const event = {
      id: payload.id,
      title: payload.title,
      start: toCivil(slot.start, timeZone),
      end: toCivil(slot.end, timeZone),
      calendarId: rule?.calendarId,
      ...(resourceId === undefined ? {} : { resources: [resourceId] }),
      ...(payload.consumption === undefined ? {} : { consumption: payload.consumption }),
      ...(payload.expiresAt === undefined
        ? {}
        : { expiresAt: toPlainDateTimeString(payload.expiresAt) }),
    } as unknown as TEvent

    const { conflicts } = host.writeChecked(
      [{ kind: 'add', event: event as TEvent & KernelEvent }],
      reason,
    )

    return conflicts.length > 0 ? { success: false, conflicts } : { success: true, event }
  }

  return {
    name: 'booking',
    requires: ['workingTime', 'availability'],
    api: (host) => ({
      getSlotRules: () => [...rulesOf(host)],
      getSlots: (options) => {
        const timeZone = timeZoneOf(host)
        const result = generateSlots({
          rules: scopeToResources(rulesOf(host, options.ruleIds), options.resourceIds),
          range: {
            start: toPlainDateTimeString(options.start),
            end: toPlainDateTimeString(options.end),
          },
          now: toPlainDateTimeString(options.now ?? new Date()),
          timeZone,
          calendars: host.getOptions().workingTime.calendars,
          resources: slotResourcesOf(host),
          events: occupyingEventsOf(host),
          maxSlots: options.maxSlots,
        })

        return {
          slots: result.slots.map(toBookingSlot),
          requiredRange: toBookingRange(result.requiredRange, timeZone),
          unbackedRanges: unbackedRangesOf(host, result.requiredRange).map((range) =>
            toBookingRange(range, timeZone),
          ),
          truncated: result.truncated,
        }
      },
      book: (slot, payload) => write(host, slot, payload, 'book'),
      hold: (slot, payload) => write(host, slot, payload, 'hold'),
    }),
  }
}
