import { Temporal } from '@js-temporal/polyfill'
import { toPlainDateTimeString } from '~/date/parse'
import {
  layoutDaySegments,
  splitEventsByDay,
  type EventLayout,
  type LayoutOptions,
  type SplittableEvent,
} from '~/projection'
import type { KernelEvent, Module } from '../types'

export const LAYOUT_FIELD = 'layout'

export interface LayoutModuleOptions extends LayoutOptions {
  timeZone: Temporal.TimeZoneLike
  priority?: number
  splitMultiDayEvents?: boolean
}

export type LaidOutEvent<E extends KernelEvent> = E & { layout: EventLayout }

const dayKeyOf = (value: string | Date | number): string =>
  toPlainDateTimeString(value).slice(0, 10)

export function layoutModule<E extends KernelEvent>(options: LayoutModuleOptions): Module<E> {
  return {
    name: 'layout',
    contributions: [
      {
        pipeline: 'projection',
        stage: 'layout',
        priority: options.priority,
        run: (ctx) => {
          const segments =
            options.splitMultiDayEvents === false
              ? ctx.events
              : (splitEventsByDay(
                  ctx.events as unknown as Array<SplittableEvent>,
                  options.timeZone,
                ) as unknown as Array<E>)

          const byDay = new Map<string, Array<number>>()
          segments.forEach((segment, index) => {
            const key = `${dayKeyOf(segment.start)}|${segment.allDay ? 'all-day' : 'timed'}`
            const bucket = byDay.get(key)
            if (bucket) bucket.push(index)
            else byDay.set(key, [index])
          })

          const out: Array<E> = Array.from({ length: segments.length })
          for (const indices of byDay.values()) {
            const layouts = layoutDaySegments(
              indices.map((index) => segments[index]!),
              options,
            )
            indices.forEach((index, position) => {
              out[index] = {
                ...segments[index]!,
                [LAYOUT_FIELD]: layouts[position]!,
              }
            })
          }

          return out
        },
      },
    ],
  }
}
