import type { Event, ResizeController, ResizeState, Resource } from "@tanstack/time";

const INERT_STATE: ResizeState = {
  isResizing: false,
  eventId: null,
  edge: null,
  previewStart: null,
  previewEnd: null,
  lastValidPreviewStart: null,
  lastValidPreviewEnd: null,
  targetDayDate: null,
  blocked: false,
};

export function inertResizeController<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): ResizeController<TResource, TEvent> {
  return {
    subscribe: () => () => {},
    getSnapshot: () => INERT_STATE,
    setOptions: () => {},
    getOptions: () => ({}),
    registerDayColumn: () => {},
    getDayFromPoint: () => null,
    getDayFromElement: () => null,
    start: () => false,
    cancel: () => {},
    destroy: () => {},
    handleMouseMove: () => {},
    handleMouseUp: () => {},
  } as unknown as ResizeController<TResource, TEvent>;
}
