import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";
import {
  durationPreservingEnd,
  expandRecurringEvent,
  getRecurringOccurrence,
  materializeRecurringEdit,
  materializeRecurringRemove,
  normalizeRecurrenceRule,
  resolveOccurrenceStart,
} from "~/recurrence";
import type {
  Event,
  EventDateTimeInput,
  RecurrenceEditScope,
} from "~/calendar/types";
import type { IntentOp, KernelEvent, Module, WriteOp } from "../types";

export const EDIT_OCCURRENCE_INTENT = "recurrence/edit-occurrence";
export const REMOVE_OCCURRENCE_INTENT = "recurrence/remove-occurrence";

export interface EditOccurrencePayload {
  masterId: string;
  scope: RecurrenceEditScope;
  occurrenceStart?: EventDateTimeInput;
  updates: Record<string, unknown>;
}

export interface RemoveOccurrencePayload {
  masterId: string;
  scope: RecurrenceEditScope;
  occurrenceStart?: EventDateTimeInput;
}

export interface RecurrenceModuleOptions {
  priority?: number;
}

export function editOccurrenceIntent(payload: EditOccurrencePayload): IntentOp {
  return { kind: "intent", intent: EDIT_OCCURRENCE_INTENT, payload };
}

export function removeOccurrenceIntent(
  payload: RemoveOccurrencePayload,
): IntentOp {
  return { kind: "intent", intent: REMOVE_OCCURRENCE_INTENT, payload };
}

function nextDay(iso: string): string {
  return Temporal.PlainDate.from(iso.slice(0, 10))
    .add({ days: 1 })
    .toString({ calendarName: "never" });
}

function dayOf(value: EventDateTimeInput): string {
  return toPlainDateTimeString(value).slice(0, 10);
}

function resolveEdit<E extends KernelEvent>(
  payload: EditOccurrencePayload,
  master: Event,
  isTaken: (id: string) => boolean,
): Array<WriteOp<E>> {
  const updates = payload.updates;

  if (!master.recurrence || payload.scope === "all") {
    return [
      {
        kind: "update",
        id: master.id,
        before: master as unknown as E,
        after: { ...master, ...updates } as unknown as E,
      },
    ];
  }

  const occurrenceStart = resolveOccurrenceStart(
    master.start,
    payload.occurrenceStart,
  );
  const occurrence = getRecurringOccurrence(master, occurrenceStart);
  if (!occurrence) return [];

  const occurrenceStartStr = toPlainDateTimeString(occurrence.start);
  const occurrenceEndStr = toPlainDateTimeString(occurrence.end);
  const nextStart = updates.start as EventDateTimeInput | undefined;
  const nextEnd = updates.end as EventDateTimeInput | undefined;

  const effectiveStart =
    nextStart != null ? toPlainDateTimeString(nextStart) : occurrenceStartStr;
  const effectiveEnd =
    nextEnd != null
      ? toPlainDateTimeString(nextEnd)
      : nextStart != null
        ? durationPreservingEnd(
            occurrenceStartStr,
            occurrenceEndStr,
            effectiveStart,
          )
        : occurrenceEndStr;

  const recurrenceUpdate = updates.recurrence as Event["recurrence"];
  const normalizedUpdates = {
    ...updates,
    ...(nextStart != null ? { start: effectiveStart } : {}),
    ...(nextEnd != null || nextStart != null ? { end: effectiveEnd } : {}),
    ...(recurrenceUpdate != null
      ? { recurrence: normalizeRecurrenceRule(recurrenceUpdate) }
      : {}),
  };

  if (
    payload.scope === "thisAndFollowing" &&
    occurrenceStart === toPlainDateTimeString(master.start)
  ) {
    return [
      {
        kind: "update",
        id: master.id,
        before: master as unknown as E,
        after: { ...master, ...normalizedUpdates } as unknown as E,
      },
    ];
  }

  const { nextMaster, addedEvents } = materializeRecurringEdit({
    master,
    scope: payload.scope,
    occurrence,
    occurrenceStart,
    effectiveStart,
    effectiveEnd,
    normalizedUpdates,
    recurrenceUpdate,
    isTaken,
  });

  const ops: Array<WriteOp<E>> = [
    {
      kind: "update",
      id: master.id,
      before: master as unknown as E,
      after: nextMaster as unknown as E,
    },
  ];
  for (const added of addedEvents) {
    ops.push({ kind: "add", event: added as unknown as E });
  }
  return ops;
}

function resolveRemove<E extends KernelEvent>(
  payload: RemoveOccurrencePayload,
  master: Event,
): Array<WriteOp<E>> {
  if (!master.recurrence || payload.scope === "all") {
    return [
      {
        kind: "remove",
        id: master.id,
        event: master as unknown as E,
      },
    ];
  }

  const occurrenceStart = resolveOccurrenceStart(
    master.start,
    payload.occurrenceStart,
  );
  const occurrence = getRecurringOccurrence(master, occurrenceStart);
  if (!occurrence) return [];

  if (
    payload.scope === "thisAndFollowing" &&
    occurrenceStart === toPlainDateTimeString(master.start)
  ) {
    return [
      {
        kind: "remove",
        id: master.id,
        event: master as unknown as E,
      },
    ];
  }

  const { nextMaster } = materializeRecurringRemove({
    master,
    scope: payload.scope,
    occurrenceStart,
  });

  return [
    {
      kind: "update",
      id: master.id,
      before: master as unknown as E,
      after: nextMaster as unknown as E,
    },
  ];
}

export function recurrenceModule<E extends KernelEvent>(
  options: RecurrenceModuleOptions = {},
): Module<E> {
  return {
    name: "recurrence",
    getRequiredRange: (op) => {
      if (op.kind !== "intent") return null;
      if (
        op.intent !== EDIT_OCCURRENCE_INTENT &&
        op.intent !== REMOVE_OCCURRENCE_INTENT
      ) {
        return null;
      }

      const payload = op.payload as EditOccurrencePayload;
      const days = [payload.occurrenceStart, payload.updates?.start as never]
        .filter((value) => value != null)
        .map((value) => dayOf(value as EventDateTimeInput));
      if (days.length === 0) return null;

      const sorted = days.slice().sort();
      return { start: sorted[0]!, end: nextDay(sorted[sorted.length - 1]!) };
    },
    contributions: [
      {
        pipeline: "projection",
        stage: "recurrence-expand",
        priority: options.priority,
        run: (ctx) => {
          const windowStart = ctx.viewport.start.slice(0, 10);
          const windowEnd = nextDay(ctx.viewport.end);

          const out: Array<E> = [];
          for (const event of ctx.events) {
            if ((event as unknown as Event).recurrence) {
              const occurrences = expandRecurringEvent(
                event as unknown as Event,
                windowStart,
                windowEnd,
              );
              out.push(...(occurrences as unknown as Array<E>));
            } else {
              out.push(event);
            }
          }
          return out;
        },
      },
      {
        pipeline: "write",
        kind: "transform",
        stage: "recurrence-materialize",
        priority: options.priority,
        run: (batch, ctx) => {
          if (!batch.ops.some((op) => op.kind === "intent")) return batch;

          const isTaken = (id: string) => ctx.getEvent(id) !== undefined;
          const ops: Array<WriteOp<E>> = [];

          for (const op of batch.ops) {
            if (op.kind !== "intent") {
              ops.push(op);
              continue;
            }

            if (
              op.intent !== EDIT_OCCURRENCE_INTENT &&
              op.intent !== REMOVE_OCCURRENCE_INTENT
            ) {
              ops.push(op);
              continue;
            }

            const payload = op.payload as
              | EditOccurrencePayload
              | RemoveOccurrencePayload;
            const master = ctx.getEvent(payload.masterId) as
              | (Event & E)
              | undefined;
            if (!master) continue;

            if (op.intent === EDIT_OCCURRENCE_INTENT) {
              ops.push(
                ...resolveEdit<E>(
                  payload as EditOccurrencePayload,
                  master,
                  isTaken,
                ),
              );
            } else {
              ops.push(
                ...resolveRemove<E>(payload as RemoveOccurrencePayload, master),
              );
            }
          }

          return { ...batch, ops };
        },
      },
    ],
  };
}
