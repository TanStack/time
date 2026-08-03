import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";
import { calculateResizedEvent } from "~/calendar/getResizeProps";
import { mergeUnavailableMinuteRanges } from "~/validation/availability";
import type {
  AvailabilityResourceInput,
  MinuteRange,
} from "~/validation/availability";
import type { ResizeEdge } from "~/calendar/getResizeProps";
import type { IntentOp, KernelEvent, Module, WriteOp } from "../types";

export const RESIZE_INTENT = "resize/apply";

export interface ResizePayload {
  eventId: string;
  edge: ResizeEdge;
  deltaMinutes: number;
  snapToMinutes?: number;
  minDurationMinutes?: number;
  unavailableRanges?: Array<MinuteRange>;
}

export interface ResizeModuleOptions {
  timeZone: Temporal.TimeZoneLike;
  resources?: Array<AvailabilityResourceInput>;
  snapToMinutes?: number;
  minDurationMinutes?: number;
  priority?: number;
}

interface ResizableEvent extends KernelEvent {
  resources?: Array<AvailabilityResourceInput | string>;
}

export function resizeIntent(payload: ResizePayload): IntentOp {
  return { kind: "intent", intent: RESIZE_INTENT, payload };
}

function resourceIdsOf(event: ResizableEvent): Array<string> {
  return (event.resources ?? []).map((resource) =>
    typeof resource === "string" ? resource : resource.id,
  );
}

export function resizeModule<E extends KernelEvent>(
  options: ResizeModuleOptions,
): Module<E> {
  const resolveRanges = (
    event: ResizableEvent,
    payload: ResizePayload,
  ): Array<MinuteRange> => {
    if (payload.unavailableRanges) return payload.unavailableRanges;
    if (!options.resources) return [];

    const ids = resourceIdsOf(event);
    if (ids.length === 0) return [];

    return (
      mergeUnavailableMinuteRanges(
        options.resources,
        toPlainDateTimeString(event.start).slice(0, 10),
        ids,
      ) ?? []
    );
  };

  return {
    name: "resize",
    contributions: [
      {
        pipeline: "write",
        kind: "transform",
        stage: "resize-materialize",
        priority: options.priority,
        run: (batch, ctx) => {
          if (
            !batch.ops.some(
              (op) => op.kind === "intent" && op.intent === RESIZE_INTENT,
            )
          ) {
            return batch;
          }

          const ops: Array<WriteOp<E>> = [];

          for (const op of batch.ops) {
            if (op.kind !== "intent" || op.intent !== RESIZE_INTENT) {
              ops.push(op);
              continue;
            }

            const payload = op.payload as ResizePayload;
            const before = ctx.getEvent(payload.eventId);
            if (!before) continue;

            const resized = calculateResizedEvent({
              originalStart: toPlainDateTimeString(before.start),
              originalEnd: toPlainDateTimeString(before.end),
              edge: payload.edge,
              deltaMinutes: payload.deltaMinutes,
              timeZone: options.timeZone,
              constraints: {
                snapToMinutes: payload.snapToMinutes ?? options.snapToMinutes,
                minDurationMinutes:
                  payload.minDurationMinutes ?? options.minDurationMinutes,
                unavailableRanges: resolveRanges(
                  before as ResizableEvent,
                  payload,
                ),
              },
            });

            ops.push({
              kind: "update",
              id: payload.eventId,
              before,
              after: { ...before, start: resized.start, end: resized.end },
            });
          }

          return { ...batch, ops };
        },
      },
    ],
  };
}
