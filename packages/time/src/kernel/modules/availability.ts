import { toPlainDateTimeString } from "~/date/parse";
import {
  checkAvailability,
  type AvailabilityConflict,
  type AvailabilityOtherEvent,
  type AvailabilityResourceInput,
} from "~/validation/availability";
import type { Conflict, KernelEvent, Module } from "../types";

export interface AvailabilityModuleResource extends AvailabilityResourceInput {}

interface CalendarLikeEvent extends KernelEvent {
  title?: string;
  resources?: Array<AvailabilityModuleResource | string>;
  consumption?: Array<number>;
  masterId?: string;
  _recurringMasterId?: string;
  _originalStart?: string;
  _originalEnd?: string;
}

export interface AvailabilityModuleOptions {
  resources: Array<AvailabilityModuleResource>;
  priority?: number;
}

function resolveResources(
  event: CalendarLikeEvent,
  known: Array<AvailabilityModuleResource>,
): Array<AvailabilityModuleResource> {
  return (event.resources ?? []).map((r) =>
    typeof r === "string"
      ? (known.find((res) => res.id === r) ?? { id: r, label: r })
      : r,
  );
}

function resourceIdsOf(event: CalendarLikeEvent): Array<string> {
  return (event.resources ?? []).map((r) => (typeof r === "string" ? r : r.id));
}

function toConflict(
  event: CalendarLikeEvent,
  conflict: AvailabilityConflict,
): Conflict {
  const reason = conflict.resourceDetails[0]?.reason ?? "outside-hours";
  return {
    code: `availability/${reason}`,
    message: conflict.description,
    eventIds: [event.id],
    detail: conflict,
  };
}

export function availabilityModule<E extends KernelEvent>(
  options: AvailabilityModuleOptions,
): Module<E> {
  const known = options.resources;

  return {
    name: "availability",
    contributions: [
      {
        pipeline: "write",
        kind: "validate",
        stage: "availability-validate",
        priority: options.priority,
        run: (batch, ctx) => {
          const conflicts: Array<Conflict> = [];

          for (const op of batch.ops) {
            if (op.kind === "remove") continue;
            const event = (
              op.kind === "add" ? op.event : op.after
            ) as CalendarLikeEvent;

            const resolved = resolveResources(event, known);
            if (resolved.length === 0) continue;

            const otherEvents: Array<AvailabilityOtherEvent> = (
              ctx.getEvents() as Array<CalendarLikeEvent>
            )
              .filter((e) => e.id !== event.id && !e._originalStart)
              .map((e) => ({
                id: e.id,
                start: toPlainDateTimeString(
                  (e._originalStart ?? e.start) as string | Date | number,
                ),
                end: toPlainDateTimeString(
                  (e._originalEnd ?? e.end) as string | Date | number,
                ),
                resourceIds: resourceIdsOf(e),
                consumption: e.consumption,
                masterId: e._recurringMasterId ?? e.id,
              }));

            const found = checkAvailability({
              event: {
                id: event.id,
                title: event.title ?? event.id,
                start: toPlainDateTimeString(event.start),
                end: toPlainDateTimeString(event.end),
              },
              resources: resolved,
              consumption: event.consumption,
              otherEvents,
            });

            for (const conflict of found) {
              conflicts.push(toConflict(event, conflict));
            }
          }

          return conflicts;
        },
      },
    ],
  };
}
