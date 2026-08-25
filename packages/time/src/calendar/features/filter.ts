import { filterModule } from '~/kernel/modules'
import type { KernelEvent } from '~/kernel'
import type { Event, Resource } from '../types'
import type { CalendarFeature } from './types'

export type EventFilterPredicate<TResource extends Resource, TEvent extends Event<TResource>> = (
  event: TEvent,
) => boolean

export interface EventFilterApi<TResource extends Resource, TEvent extends Event<TResource>> {
  setEventFilter: (id: string, predicate: EventFilterPredicate<TResource, TEvent> | null) => void

  clearEventFilters: () => void

  getEventFilterIds: () => Array<string>

  isEventVisible: (event: TEvent) => boolean

  getHiddenEvents: () => Array<TEvent>
}

export function eventFilterFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<TResource, TEvent, object, EventFilterApi<TResource, TEvent>, 'filter'> {
  const predicates = new Map<string, EventFilterPredicate<TResource, TEvent>>()

  const isEventVisible = (event: TEvent) => {
    for (const predicate of predicates.values()) {
      if (!predicate(event)) return false
    }
    return true
  }

  return {
    name: 'filter',
    module: () =>
      filterModule<TEvent & KernelEvent>({
        getPredicates: () => [...predicates.values()],
      }),
    api: (host) => ({
      setEventFilter: (id, predicate) => {
        if (predicate) predicates.set(id, predicate)
        else if (!predicates.delete(id)) return

        host.invalidateEvents()
      },
      clearEventFilters: () => {
        if (predicates.size === 0) return

        predicates.clear()
        host.invalidateEvents()
      },
      getEventFilterIds: () => [...predicates.keys()],
      isEventVisible,
      getHiddenEvents: () => host.getEvents().filter((event) => !isEventVisible(event)),
    }),
  }
}
