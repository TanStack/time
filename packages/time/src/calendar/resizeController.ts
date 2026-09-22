import { getTimeClient } from '../client'
import {
  calculateDeltaMinutesFromPixels,
  calculateDeltaMinutesFromPixelsHorizontal,
} from './getResizeProps'
import type { ResizeConstraints, ResizeEdge } from './getResizeProps'
import type { CalendarCore } from './calendar'
import type {
  Event,
  EventDateTimeInput,
  RecurrenceEditScope,
  ResizeError,
  Resource,
} from './types'

export interface ResizeState {
  isResizing: boolean
  eventId: string | null
  edge: ResizeEdge | null
  previewStart: string | null
  previewEnd: string | null
  lastValidPreviewStart: string | null
  lastValidPreviewEnd: string | null
  targetDayDate: string | null
  blocked: boolean
}

export interface ResizeControllerOptions {
  enabled?: boolean
  containerHeight?: number
  containerWidth?: number
  orientation?: 'vertical' | 'horizontal'
  constraints?: ResizeConstraints
  onResizeStart?: (eventId: string, edge: ResizeEdge) => void
  onResizeEnd?: (eventId: string, newStart: string, newEnd: string) => void
  onRecurringResizeEnd?: (resize: {
    eventId: string
    occurrenceStart: EventDateTimeInput
    originalStart: string
    originalEnd: string
    newStart: string
    newEnd: string
  }) => void
  onResizeError?: (error: ResizeError) => void
}

export interface ResizeStartArgs {
  eventId: string
  edge: ResizeEdge
  originalStart: string
  originalEnd: string
  occurrenceStart?: EventDateTimeInput
  recurrenceScope?: RecurrenceEditScope
  clientX: number
  clientY: number
  /**
   * Optional element under the pointer (e.g. `e.target as HTMLElement`).
   * Used to resolve the originating day column without `getBoundingClientRect`.
   */
  target?: HTMLElement | null
}

export type ResizeListener = () => void

const INITIAL_RESIZE_STATE: ResizeState = {
  isResizing: false,
  eventId: null,
  edge: null,
  previewStart: null,
  previewEnd: null,
  lastValidPreviewStart: null,
  lastValidPreviewEnd: null,
  targetDayDate: null,
  blocked: false,
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * Framework-agnostic controller that owns:
 *  - resize state machine (preview, blocked, lastValid)
 *  - rAF coalescing for `mousemove`
 *  - day-column registry + cached rects
 *  - last-processed dedupe + last-emitted-error dedupe
 *  - delegation to `CalendarCore.validateResize` / `commitUpdate`
 *
 * UI bindings (React, Solid, etc.) only need to:
 *  1. Subscribe to state changes and read `getSnapshot()`.
 *  2. Forward DOM `mousedown` to `start()`, then attach `handleMouseMove` /
 *     `handleMouseUp` to `document` (the controller exposes these as bound
 *     methods so the same reference can be used for `addEventListener` /
 *     `removeEventListener`).
 *  3. Call `registerDayColumn(date, element)` from a ref callback.
 */
export class ResizeController<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  private _calendarCore: CalendarCore<TResource, TEvent>
  private _options: ResizeControllerOptions

  private _state: ResizeState = INITIAL_RESIZE_STATE
  private _listeners = new Set<ResizeListener>()

  private _dayColumns = new Map<string, HTMLElement>()

  private _dayRects: Array<{ date: string; left: number; right: number }> = []

  private _original: {
    id: string
    start: string
    end: string
    occurrenceStart?: EventDateTimeInput
    recurrenceScope?: RecurrenceEditScope
    edge: ResizeEdge
    startY: number
    startX: number
    originalDayDate: string
    currentDayDate: string
    totalDaysInView: number
  } | null = null

  private _lastEmittedError: {
    eventId: string
    message: string
    timestamp: number
  } | null = null

  private _lastProcessed: { delta: number; day: string } | null = null

  private _pendingMouseEvent: MouseEvent | null = null
  private _rafId: number | null = null

  constructor(
    calendarCore: CalendarCore<TResource, TEvent>,
    options: ResizeControllerOptions = {},
  ) {
    this._calendarCore = calendarCore
    this._options = options

    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
  }

  subscribe = (listener: ResizeListener): (() => void) => {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  getSnapshot = (): ResizeState => this._state

  setOptions(options: ResizeControllerOptions) {
    this._options = options
  }

  getOptions(): ResizeControllerOptions {
    return this._options
  }

  registerDayColumn(date: string, element: HTMLElement | null) {
    if (element) {
      this._dayColumns.set(date, element)
    } else {
      this._dayColumns.delete(date)
    }
  }

  getDayFromPoint(clientX: number): string | null {
    const cached = this._dayRects
    if (cached.length > 0) {
      for (const r of cached) {
        if (clientX >= r.left && clientX <= r.right) return r.date
      }
      return null
    }
    for (const [dayDate, element] of this._dayColumns) {
      const rect = element.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right) return dayDate
    }
    return null
  }

  getDayFromElement(element: HTMLElement): string | null {
    for (const [dayDate, dayElement] of this._dayColumns) {
      if (dayElement.contains(element)) return dayDate
    }
    return null
  }

  start(args: ResizeStartArgs): boolean {
    if (!(this._options.enabled ?? true)) return false

    const dayDate =
      (args.target ? this.getDayFromElement(args.target) : null) ??
      this.getDayFromPoint(args.clientX)
    if (!dayDate) return false

    this._original = {
      id: args.eventId,
      start: args.originalStart,
      end: args.originalEnd,
      occurrenceStart: args.occurrenceStart,
      recurrenceScope: args.recurrenceScope,
      edge: args.edge,
      startY: args.clientY,
      startX: args.clientX,
      originalDayDate: dayDate,
      currentDayDate: dayDate,
      totalDaysInView: this._calendarCore.getDaysWithEvents().length,
    }

    this._refreshDayRects()
    this._lastProcessed = null

    this._update({
      isResizing: true,
      eventId: args.eventId,
      edge: args.edge,
      previewStart: args.originalStart,
      previewEnd: args.originalEnd,
      lastValidPreviewStart: args.originalStart,
      lastValidPreviewEnd: args.originalEnd,
      targetDayDate: dayDate,
    })
    this._options.onResizeStart?.(args.eventId, args.edge)
    this._attachDomListeners()
    return true
  }

  cancel() {
    this._cancelPendingFrame()
    this._detachDomListeners()
    this._original = null
    this._lastEmittedError = null
    this._lastProcessed = null
    this._dayRects = []
    this._replaceState(INITIAL_RESIZE_STATE)
  }

  destroy() {
    this._cancelPendingFrame()
    this._detachDomListeners()
    this._listeners.clear()
    this._dayColumns.clear()
    this._dayRects = []
    this._original = null
    this._lastEmittedError = null
    this._lastProcessed = null
    this._state = INITIAL_RESIZE_STATE
  }

  handleMouseMove(e: MouseEvent) {
    this._pendingMouseEvent = e
    if (this._rafId !== null) return
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null
      const ev = this._pendingMouseEvent
      this._pendingMouseEvent = null
      if (ev) this._processMouseMove(ev)
    })
  }

  /**
   * Mouse-up handler. Auto-attached by `start()`; commits if the preview
   * differs from the original event range, then detaches DOM listeners.
   */
  handleMouseUp() {
    this._cancelPendingFrame()
    this._detachDomListeners()
    this._lastProcessed = null
    this._dayRects = []

    const currentState = this._state
    const original = this._original

    if (
      currentState.eventId &&
      currentState.previewStart &&
      currentState.previewEnd
    ) {
      const hasChanged =
        !original ||
        currentState.previewStart !== original.start ||
        currentState.previewEnd !== original.end

      if (hasChanged) {
        const emitResizeEnd = () => {
          this._options.onResizeEnd?.(
            currentState.eventId!,
            currentState.previewStart!,
            currentState.previewEnd!,
          )
        }

        const commitRecurringResize = (scope: RecurrenceEditScope) => {
          void this._calendarCore
            .editRecurringEvent(
              currentState.eventId!,
              {
                start: currentState.previewStart!,
                end: currentState.previewEnd!,
              } as Partial<Omit<TEvent, 'id'>>,
              {
                scope,
                occurrenceStart: original!.occurrenceStart,
              },
            )
            .then((result) => {
              if (!result.success) {
                this._options.onResizeError?.(result.error)
                return
              }
              emitResizeEnd()
            })
        }

        if (original?.occurrenceStart != null) {
          if (!original.recurrenceScope && this._options.onRecurringResizeEnd) {
            this._options.onRecurringResizeEnd({
              eventId: currentState.eventId,
              occurrenceStart: original.occurrenceStart,
              originalStart: original.start,
              originalEnd: original.end,
              newStart: currentState.previewStart,
              newEnd: currentState.previewEnd,
            })
          } else {
            commitRecurringResize(original.recurrenceScope ?? 'this')
          }
        } else {
          this._calendarCore.commitUpdate(currentState.eventId, {
            start: currentState.previewStart,
            end: currentState.previewEnd,
          } as Partial<Omit<TEvent, 'id'>>)
          emitResizeEnd()
        }
      }
    }

    this._original = null
    this._lastEmittedError = null
    this._replaceState(INITIAL_RESIZE_STATE)
  }

  private _refreshDayRects() {
    const arr: Array<{ date: string; left: number; right: number }> = []
    for (const [dayDate, element] of this._dayColumns) {
      const rect = element.getBoundingClientRect()
      arr.push({ date: dayDate, left: rect.left, right: rect.right })
    }
    this._dayRects = arr
  }

  private _cancelPendingFrame() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
    this._pendingMouseEvent = null
  }

  private _notify() {
    for (const l of this._listeners) l()
  }

  private _update(patch: Partial<ResizeState>) {
    this._state = { ...this._state, ...patch }
    this._notify()
  }

  private _replaceState(next: ResizeState) {
    this._state = next
    this._notify()
  }

  /**
   * Run a single resize iteration: derive delta, dedupe, validate, emit
   * error (rate-limited), and update preview state.
   */
  private _processMouseMove(e: MouseEvent) {
    const original = this._original
    if (!original) return

    const opts = this._options
    const containerHeight = opts.containerHeight ?? 0
    const containerWidth = opts.containerWidth ?? 0
    const orientation = opts.orientation ?? 'vertical'
    const constraints = opts.constraints

    const { id, start, end, edge, startY, startX, originalDayDate } = original

    let targetDayDate: string
    let totalDeltaMinutes: number

    if (orientation === 'horizontal') {
      if (containerWidth === 0) return
      const totalMinutesInView = original.totalDaysInView * 24 * 60
      totalDeltaMinutes = calculateDeltaMinutesFromPixelsHorizontal(
        e.clientX - startX,
        containerWidth,
        totalMinutesInView,
      )
      targetDayDate = originalDayDate
    } else {
      const deltaMinutes = calculateDeltaMinutesFromPixels(
        e.clientY - startY,
        containerHeight,
      )

      targetDayDate = this.getDayFromPoint(e.clientX) ?? originalDayDate

      let dayOffsetMinutes = 0
      if (targetDayDate !== originalDayDate) {
        const originalDate = new Date(originalDayDate + 'T00:00:00')
        const targetDate = new Date(targetDayDate + 'T00:00:00')
        const dayDiff = Math.round(
          (targetDate.getTime() - originalDate.getTime()) / MS_PER_DAY,
        )
        dayOffsetMinutes = dayDiff * 24 * 60
        original.currentDayDate = targetDayDate
      }

      totalDeltaMinutes = deltaMinutes + dayOffsetMinutes
    }

    const snapToMinutes = constraints?.snapToMinutes ?? 1
    const snappedDelta =
      snapToMinutes > 1
        ? Math.round(totalDeltaMinutes / snapToMinutes) * snapToMinutes
        : totalDeltaMinutes
    const last = this._lastProcessed
    if (last && last.delta === snappedDelta && last.day === targetDayDate) {
      return
    }
    this._lastProcessed = { delta: snappedDelta, day: targetDayDate }

    const validation = this._calendarCore.validateResize({
      eventId: id,
      originalStart: start,
      originalEnd: end,
      edge,
      totalDeltaMinutes,
      targetDayDate,
      originalDayDate,
      occurrenceStart: original.occurrenceStart,
      constraints,
    })

    if (validation.blocked && validation.error) {
      this._maybeEmitError(id, start, end, validation.error)
    } else {
      this._lastEmittedError = null
    }

    const currentState = this._state
    const effectivePreviewStart = validation.blocked
      ? (currentState.lastValidPreviewStart ?? start)
      : validation.result.start
    const effectivePreviewEnd = validation.blocked
      ? (currentState.lastValidPreviewEnd ?? end)
      : validation.result.end

    this._update({
      eventId: id,
      previewStart: effectivePreviewStart,
      previewEnd: effectivePreviewEnd,
      ...(!validation.blocked && {
        lastValidPreviewStart: validation.result.start,
        lastValidPreviewEnd: validation.result.end,
      }),
      targetDayDate: validation.targetDayDate,
      blocked: validation.blocked,
    })
  }

  /**
   * Emit a resize error via TimeClient + onResizeError callback, but rate-limit
   * to avoid flooding when the user dwells in an invalid area: the same
   * `(eventId, message)` pair is suppressed for 500ms.
   */
  private _maybeEmitError(
    eventId: string,
    originalStart: string,
    originalEnd: string,
    error: {
      reason: ResizeError['reason']
      message: string
      conflicts: NonNullable<ResizeError['conflicts']>
    },
  ) {
    const now = Date.now()
    const lastError = this._lastEmittedError
    const shouldEmit =
      !lastError ||
      lastError.eventId !== eventId ||
      lastError.message !== error.message ||
      now - lastError.timestamp > 500
    if (!shouldEmit) return

    const event = this._calendarCore.getEvents().find((ev) => ev.id === eventId)
    const eventTitle = event?.title ?? 'Unknown Event'
    const conflicts = error.conflicts.length > 0 ? error.conflicts : undefined

    const resizeError: ResizeError = {
      eventId,
      eventTitle,
      reason: error.reason,
      message: error.message,
      originalStart,
      originalEnd,
      conflicts,
    }

    getTimeClient().emit('event:update:error', {
      eventId,
      eventTitle,
      reason: error.reason,
      message: error.message,
      originalStart,
      originalEnd,
      conflicts,
    })

    this._options.onResizeError?.(resizeError)

    this._lastEmittedError = {
      eventId,
      message: error.message,
      timestamp: now,
    }
  }

  private _domListenersAttached = false

  private _attachDomListeners() {
    if (this._domListenersAttached) return
    if (typeof document === 'undefined') return
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
    this._domListenersAttached = true
  }

  private _detachDomListeners() {
    if (!this._domListenersAttached) return
    if (typeof document === 'undefined') return
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
    this._domListenersAttached = false
  }
}
