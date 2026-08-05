import { toPlainDateTimeString } from "~/date/parse";
import { getSegmentInfo } from "../getResizeProps";
import { ResizeController } from "../resizeController";
import type { SegmentInfo } from "../getResizeProps";
import type { ResizeControllerOptions } from "../resizeController";
import type { Event, Resource } from "../types";
import type { CalendarFeature } from "./types";

export interface ResizeFeatureApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  createResizeController: (
    options?: ResizeControllerOptions,
  ) => ResizeController<TResource, TEvent>;
  getEventSegmentInfo: (event: TEvent) => SegmentInfo;
}

export function eventResizeFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  object,
  ResizeFeatureApi<TResource, TEvent>
> {
  return {
    name: "resize",
    requires: ["recurrence"],
    api: (host) => ({
      createResizeController: (options = {}) =>
        new ResizeController<TResource, TEvent>(host, options),
      getEventSegmentInfo: (event) =>
        getSegmentInfo({
          start: toPlainDateTimeString(event.start),
          end: toPlainDateTimeString(event.end),
          ...(event._originalStart != null
            ? { _originalStart: event._originalStart }
            : {}),
          ...(event._originalEnd != null
            ? { _originalEnd: event._originalEnd }
            : {}),
        }),
    }),
  };
}
