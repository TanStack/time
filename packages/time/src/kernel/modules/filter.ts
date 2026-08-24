import type { KernelEvent, Module } from '../types'

export type EventPredicate<E extends KernelEvent> = (event: E) => boolean

export interface FilterModuleOptions<E extends KernelEvent> {
  getPredicates: () => ReadonlyArray<EventPredicate<E>>
  priority?: number
}

export function filterModule<E extends KernelEvent>(options: FilterModuleOptions<E>): Module<E> {
  return {
    name: 'filter',
    contributions: [
      {
        pipeline: 'projection',
        stage: 'filter',
        priority: options.priority,
        run: (ctx) => {
          const predicates = options.getPredicates()
          if (predicates.length === 0) return ctx.events

          return ctx.events.filter((event) => predicates.every((predicate) => predicate(event)))
        },
      },
    ],
  }
}
