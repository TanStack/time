import type { Event, MoveController, MoveState, Resource } from '@tanstack/time'

const INERT_STATE: MoveState = {
  isMoving: false,
  eventId: null,
  granularity: null,
  previewStart: null,
  previewEnd: null,
  lastValidPreviewStart: null,
  lastValidPreviewEnd: null,
  originDayDate: null,
  targetDayDate: null,
  blocked: false,
}

export function inertMoveController<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): MoveController<TResource, TEvent> {
  return {
    subscribe: () => () => {},
    getSnapshot: () => INERT_STATE,
    setOptions: () => {},
    getOptions: () => ({}),
    start: () => false,
    moveTo: () => {},
    end: () => {},
    cancel: () => {},
    destroy: () => {},
  } as unknown as MoveController<TResource, TEvent>
}
