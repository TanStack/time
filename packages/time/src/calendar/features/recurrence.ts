import { Temporal } from "@js-temporal/polyfill";
import { getTimeClient } from "../../client";
import { toPlainDateTimeString } from "~/date/parse";
import {
  editOccurrenceIntent,
  recurrenceModule,
  removeOccurrenceIntent,
} from "~/kernel/modules";
import {
  durationPreservingEnd,
  getRecurringOccurrence,
  masterIdOf,
  nextOccurrenceDate,
  normalizeRecurrenceRule,
  previousOccurrenceDate,
  resolveOccurrenceStart,
} from "~/recurrence";
import type { InvertibleOp, KernelEvent } from "~/kernel";
import type { RecurrenceApi } from "~/kernel/modules";
import type {
  Event,
  EventDateTimeInput,
  EventDependency,
  RecurrenceEditScope,
  Resource,
  SaveEventResult,
} from "../types";
import type { CalendarFeature, CalendarHost } from "./types";

type RecurrenceEmit =
  | {
      type: "updated";
      eventId: string;
      eventTitle: string;
      start: string;
      end: string;
      updates: Record<string, unknown>;
    }
  | {
      type: "removed";
      eventId: string;
      eventTitle: string;
      start: string;
      end: string;
    };

export interface RecurrenceNavigationApi {
  goToNextOccurrence: (eventId: string, fromDate?: EventDateTimeInput) => void;
  goToPreviousOccurrence: (
    eventId: string,
    fromDate?: EventDateTimeInput,
  ) => void;
}

export interface RecurrenceEditApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  editRecurringEvent: (
    eventId: string,
    updates: Partial<Omit<TEvent, "id">>,
    options: {
      scope: RecurrenceEditScope;
      occurrenceStart?: EventDateTimeInput;
      dependsOn?: Array<EventDependency>;
    },
  ) => Promise<SaveEventResult>;
  removeRecurringEvent: (
    eventId: string,
    options: {
      scope: RecurrenceEditScope;
      occurrenceStart?: EventDateTimeInput;
    },
  ) => void;
}

export interface RecurrenceReadApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  getMasterEvent: (event: TEvent) => TEvent;
}

export function eventRecurrenceFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  RecurrenceApi<TEvent & KernelEvent>,
  RecurrenceNavigationApi &
    RecurrenceEditApi<TResource, TEvent> &
    RecurrenceReadApi<TResource, TEvent>,
  "recurrence"
> {
  const resolveMaster = (
    host: CalendarHost<TResource, TEvent>,
    eventId: string,
  ): TEvent | undefined =>
    host.getEvent(eventId) ?? host.getEvent(masterIdOf(eventId));

  const cursor = (
    host: CalendarHost<TResource, TEvent>,
    fromDate?: EventDateTimeInput,
  ): string =>
    fromDate
      ? toPlainDateTimeString(fromDate).slice(0, 10)
      : host.getState().activeDate;

  const addedFrom = (ops: Array<InvertibleOp<TEvent>>): Array<TEvent> =>
    ops.flatMap((op) => (op.kind === "add" ? [op.event] : []));

  const emitResult = (emit: RecurrenceEmit, added: Array<TEvent>) => {
    for (const event of added) {
      getTimeClient().emit("event:added", {
        eventId: event.id,
        eventTitle: event.title,
        start: event.start as string,
        end: event.end as string,
      });
    }

    if (emit.type === "updated") {
      getTimeClient().emit("event:updated", {
        eventId: emit.eventId,
        eventTitle: emit.eventTitle,
        start: emit.start,
        end: emit.end,
        updates: emit.updates,
      });
      return;
    }

    getTimeClient().emit("event:removed", {
      eventId: emit.eventId,
      eventTitle: emit.eventTitle,
      start: emit.start,
      end: emit.end,
    });
  };

  const writeOccurrenceEdit = (
    host: CalendarHost<TResource, TEvent>,
    master: TEvent,
    scope: RecurrenceEditScope,
    occurrenceStart: string,
    updates: Partial<Omit<TEvent, "id">>,
    emit: RecurrenceEmit | ((splitEvent: TEvent | undefined) => RecurrenceEmit),
  ) => {
    const committed = host.write(
      [
        editOccurrenceIntent({
          masterId: master.id,
          scope,
          occurrenceStart,
          updates: updates as Record<string, unknown>,
        }),
      ],
      "recurrence/updated",
    );
    if (committed.length === 0) return;

    const added = addedFrom(committed);
    emitResult(typeof emit === "function" ? emit(added[0]) : emit, added);
  };

  const writeOccurrenceRemove = (
    host: CalendarHost<TResource, TEvent>,
    master: TEvent,
    scope: RecurrenceEditScope,
    occurrenceStart: string,
    emit: RecurrenceEmit,
  ) => {
    const committed = host.write(
      [removeOccurrenceIntent({ masterId: master.id, scope, occurrenceStart })],
      "recurrence/removed",
    );
    if (committed.length === 0) return;

    emitResult(emit, addedFrom(committed));
  };

  return {
    name: "recurrence",
    module: () => recurrenceModule<TEvent & KernelEvent>(),
    api: (host, module) => ({
      getMasterEvent: (event) =>
        module.getMasterEvent(event as TEvent & KernelEvent) as TEvent,
      goToNextOccurrence: (eventId, fromDate) => {
        const master = resolveMaster(host, eventId);
        if (!master) return;

        const next = nextOccurrenceDate<TResource, TEvent>(
          master,
          cursor(host, fromDate),
        );
        if (next) host.goToSpecificPeriod(next);
      },
      goToPreviousOccurrence: (eventId, fromDate) => {
        const master = resolveMaster(host, eventId);
        if (!master) return;

        const previous = previousOccurrenceDate<TResource, TEvent>(
          master,
          cursor(host, fromDate),
        );
        if (previous) host.goToSpecificPeriod(previous);
      },
      editRecurringEvent: async (eventId, updates, options) => {
        const master = resolveMaster(host, eventId);
        if (!master) {
          return {
            success: false,
            error: {
              eventId,
              eventTitle: "",
              reason: "blocked",
              message: `Event "${eventId}" not found.`,
              originalStart: "",
              originalEnd: "",
            },
          };
        }

        if (!master.recurrence || options.scope === "all") {
          return host.editEvent(master.id, updates, {
            dependsOn: options.dependsOn,
          });
        }

        const occurrenceStart = resolveOccurrenceStart(
          master.start,
          options.occurrenceStart,
        );
        const occurrence = getRecurringOccurrence<TResource, TEvent>(
          master,
          occurrenceStart,
        );
        if (!occurrence) {
          return {
            success: false,
            error: {
              eventId,
              eventTitle: master.title,
              reason: "blocked",
              message: `Occurrence "${occurrenceStart}" not found.`,
              originalStart: occurrenceStart,
              originalEnd: occurrenceStart,
            },
          };
        }

        const occurrenceStartStr = toPlainDateTimeString(occurrence.start);
        const occurrenceEndStr = toPlainDateTimeString(occurrence.end);
        const effectiveStart =
          updates.start != null
            ? toPlainDateTimeString(updates.start)
            : occurrenceStartStr;
        const effectiveEnd =
          updates.end != null
            ? toPlainDateTimeString(updates.end)
            : updates.start != null
              ? durationPreservingEnd(
                  occurrenceStartStr,
                  occurrenceEndStr,
                  effectiveStart,
                )
              : occurrenceEndStr;

        const oldStartDateStr = occurrenceStartStr.slice(0, 10);
        const newStartDateStr = effectiveStart.slice(0, 10);
        const rangeStart =
          oldStartDateStr < newStartDateStr ? oldStartDateStr : newStartDateStr;
        const oldEndDate = Temporal.PlainDate.from(
          occurrenceEndStr.slice(0, 10),
        ).add({ days: 1 });
        const newEndDate = Temporal.PlainDate.from(
          effectiveEnd.slice(0, 10),
        ).add({ days: 1 });
        const rangeEndPlain =
          Temporal.PlainDate.compare(oldEndDate, newEndDate) > 0
            ? oldEndDate
            : newEndDate;
        await host.fetchEventsForRange(
          rangeStart,
          rangeEndPlain.toString({ calendarName: "never" }),
        );

        if (options.dependsOn && options.dependsOn.length > 0) {
          const depValidation = host.validateEventDependencies(
            {
              id: occurrence.id,
              title: (updates.title as string | undefined) ?? occurrence.title,
              start: effectiveStart,
              end: effectiveEnd,
            },
            options.dependsOn,
          );
          if (!depValidation.valid && depValidation.error) {
            return { success: false, error: depValidation.error };
          }
        }

        const startChanged = updates.start !== undefined;
        const endChanged = updates.end !== undefined;
        const resourcesChanged = updates.resources !== undefined;
        const consumptionChanged = updates.consumption !== undefined;

        if (
          startChanged ||
          endChanged ||
          resourcesChanged ||
          consumptionChanged
        ) {
          const placementValidation = host.validateEventPlacement({
            id: occurrence.id,
            title: (updates.title as string | undefined) ?? occurrence.title,
            start: effectiveStart,
            end: effectiveEnd,
            resources: updates.resources ?? occurrence.resources,
            consumption: updates.consumption ?? occurrence.consumption,
          });
          if (placementValidation.blocked) {
            return {
              success: false,
              error: {
                eventId,
                eventTitle: occurrence.title,
                reason: "blocked",
                message:
                  placementValidation.message ??
                  `Cannot move "${occurrence.title}" to this position.`,
                originalStart: occurrenceStartStr,
                originalEnd: occurrenceEndStr,
                attemptedStart: effectiveStart,
                attemptedEnd: effectiveEnd,
              },
            };
          }
        }

        const recurrenceUpdate = (
          updates as { recurrence?: TEvent["recurrence"] }
        ).recurrence;
        const normalizedUpdates = {
          ...updates,
          ...(updates.start != null ? { start: effectiveStart } : {}),
          ...(updates.end != null || updates.start != null
            ? { end: effectiveEnd }
            : {}),
          ...(recurrenceUpdate != null
            ? { recurrence: normalizeRecurrenceRule(recurrenceUpdate) }
            : {}),
        } as Partial<Omit<TEvent, "id">>;

        if (options.scope === "this") {
          writeOccurrenceEdit(host, master, "this", occurrenceStart, updates, {
            type: "updated",
            eventId: occurrence.id,
            eventTitle:
              (updates.title as string | undefined) ?? occurrence.title,
            start: effectiveStart,
            end: effectiveEnd,
            updates: normalizedUpdates as Record<string, unknown>,
          });
          return { success: true };
        }

        if (occurrenceStart === toPlainDateTimeString(master.start)) {
          return host.editEvent(master.id, updates, {
            dependsOn: options.dependsOn,
          });
        }

        writeOccurrenceEdit(
          host,
          master,
          "thisAndFollowing",
          occurrenceStart,
          updates,
          (added) => ({
            type: "updated",
            eventId: added!.id,
            eventTitle: added!.title,
            start: added!.start as string,
            end: added!.end as string,
            updates: normalizedUpdates as Record<string, unknown>,
          }),
        );

        return { success: true };
      },
      removeRecurringEvent: (eventId, options) => {
        const master = resolveMaster(host, eventId);
        if (!master) return;

        if (!master.recurrence || options.scope === "all") {
          host.removeEvent(master.id);
          return;
        }

        const occurrenceStart = resolveOccurrenceStart(
          master.start,
          options.occurrenceStart,
        );
        const occurrence = getRecurringOccurrence<TResource, TEvent>(
          master,
          occurrenceStart,
        );
        if (!occurrence) return;

        const occurrenceStartStr = toPlainDateTimeString(occurrence.start);
        const occurrenceEndStr = toPlainDateTimeString(occurrence.end);

        if (options.scope === "this") {
          writeOccurrenceRemove(host, master, "this", occurrenceStart, {
            type: "removed",
            eventId: occurrence.id,
            eventTitle: occurrence.title,
            start: occurrenceStartStr,
            end: occurrenceEndStr,
          });
          return;
        }

        if (occurrenceStart === toPlainDateTimeString(master.start)) {
          host.removeEvent(master.id);
          return;
        }

        writeOccurrenceRemove(
          host,
          master,
          "thisAndFollowing",
          occurrenceStart,
          {
            type: "removed",
            eventId: occurrence.id,
            eventTitle: occurrence.title,
            start: occurrenceStartStr,
            end: occurrenceEndStr,
          },
        );
      },
    }),
  };
}
