import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { useStore } from '@tanstack/solid-store'
import { createCalendar as createCalendarCore } from '@tanstack/time'
import type { Accessor } from 'solid-js'
import type {
  Calendar,
  CalendarCoreOptions,
  CalendarFeatureList,
  CalendarStore,
  Day,
  Event,
  EventDateTimeInput,
  FeatureName,
  RecurrenceEditScope,
  ResizeController,
  ResizeControllerOptions,
  ResizeEdge,
  ResizeState,
  Resource,
} from '@tanstack/time'

export type { ResizeState } from '@tanstack/time'

export type ResizeOptions = ResizeControllerOptions

interface ResizeHandleHandlers {
  onMouseDown: (event: MouseEvent) => void
}

interface ResizeHandleOptions {
  occurrenceStart?: EventDateTimeInput
  recurrenceScope?: RecurrenceEditScope
}

interface DayColumnProps {
  ref: (element: HTMLElement | null) => void
}

export interface CreateCalendarOptions<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> extends CalendarCoreOptions<TFeatures, TResource, TEvent> {
  resize?: ResizeOptions | Accessor<ResizeOptions>
}

export interface SolidResizeApi {
  resizeState: Accessor<ResizeState>
  getResizeHandleProps: (
    eventId: string,
    edge: ResizeEdge,
    originalStart: string,
    originalEnd: string,
    options?: ResizeHandleOptions,
  ) => ResizeHandleHandlers
  getDayColumnProps: (dayDate: string) => DayColumnProps
}

type ComposedResizeApi<TFeatures extends CalendarFeatureList> =
  'resize' extends FeatureName<TFeatures[number]> ? SolidResizeApi : object

export type SolidCalendar<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = {
  calendar: Calendar<TFeatures, TResource, TEvent>
  state: Accessor<CalendarStore>
  days: Accessor<Array<Day<TResource, TEvent>>>
  isPending: Accessor<boolean>
} & ComposedResizeApi<TFeatures>

export function createCalendar<
  const TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  options: CreateCalendarOptions<TFeatures, TResource, TEvent>,
): SolidCalendar<TFeatures, TResource, TEvent> {
  const { resize, ...calendarOptions } = options
  const calendar = createCalendarCore<TFeatures, TResource, TEvent>(calendarOptions)

  const state = useStore(calendar.store)
  const isPending = useStore(calendar.store, (snapshot) => snapshot.isPending)
  const rangeKey = useStore(
    calendar.store,
    (snapshot) =>
      `${snapshot.currentPeriod}|${snapshot.activeDate}|${snapshot.viewMode.value}|${snapshot.viewMode.unit}`,
  )
  const daysKey = useStore(
    calendar.store,
    (snapshot) =>
      `${snapshot.currentPeriod}|${snapshot.activeDate}|${snapshot.viewMode.value}|${snapshot.viewMode.unit}|${snapshot.eventsVersion}`,
  )

  createEffect(() => {
    rangeKey()
    calendar.ensureRangeLoaded()
  })

  const days = createMemo(() => {
    daysKey()
    return calendar.getDaysWithEvents()
  })

  const base = { calendar, state, days, isPending }
  if (!calendar.hasFeature('resize')) {
    return base as SolidCalendar<TFeatures, TResource, TEvent>
  }

  const controller = (
    calendar as unknown as {
      createResizeController: (
        options?: ResizeControllerOptions,
      ) => ResizeController<TResource, TEvent>
    }
  ).createResizeController(typeof resize === 'function' ? resize() : resize)

  const [resizeState, setResizeState] = createSignal(controller.getSnapshot())
  onCleanup(controller.subscribe(() => setResizeState(controller.getSnapshot())))
  onCleanup(() => controller.destroy())

  createEffect(() => {
    controller.setOptions((typeof resize === 'function' ? resize() : resize) ?? {})
  })

  const handleCache = new Map<string, ResizeHandleHandlers>()
  const dayColumnCache = new Map<string, DayColumnProps>()

  const getResizeHandleProps = (
    eventId: string,
    edge: ResizeEdge,
    originalStart: string,
    originalEnd: string,
    handleOptions?: ResizeHandleOptions,
  ): ResizeHandleHandlers => {
    const key = `${eventId}|${edge}|${originalStart}|${originalEnd}|${handleOptions?.occurrenceStart ?? ''}|${handleOptions?.recurrenceScope ?? ''}`
    const cached = handleCache.get(key)
    if (cached) return cached

    const handlers: ResizeHandleHandlers = {
      onMouseDown: (event) => {
        const started = controller.start({
          eventId,
          edge,
          originalStart,
          originalEnd,
          occurrenceStart: handleOptions?.occurrenceStart,
          recurrenceScope: handleOptions?.recurrenceScope,
          clientX: event.clientX,
          clientY: event.clientY,
          target: event.target as HTMLElement | null,
        })
        if (!started) return

        event.preventDefault()
        event.stopPropagation()
      },
    }

    handleCache.set(key, handlers)
    return handlers
  }

  const getDayColumnProps = (dayDate: string): DayColumnProps => {
    const cached = dayColumnCache.get(dayDate)
    if (cached) return cached

    const props: DayColumnProps = {
      ref: (element) => {
        controller.registerDayColumn(dayDate, element)
      },
    }
    dayColumnCache.set(dayDate, props)
    return props
  }

  return {
    ...base,
    resizeState,
    getResizeHandleProps,
    getDayColumnProps,
  } as SolidCalendar<TFeatures, TResource, TEvent>
}
