import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";
import { expandRecurringEvent } from "./expandRecurringEvent";
import type {
  Event,
  EventDateTimeInput,
  RecurrenceRule,
  Resource,
} from "~/calendar/types";

export function normalizeRecurrenceRule<TResource extends Resource>(
  rule: RecurrenceRule<TResource>,
): RecurrenceRule<TResource> {
  return {
    ...rule,
    exDates: rule.exDates?.map((value) =>
      typeof value === "string" && !value.includes("T")
        ? value
        : toPlainDateTimeString(value),
    ),
    overrides: rule.overrides?.map((override) => ({
      ...override,
      originalStart:
        typeof override.originalStart === "string" &&
        !override.originalStart.includes("T")
          ? override.originalStart
          : toPlainDateTimeString(override.originalStart),
      ...(override.start != null
        ? { start: toPlainDateTimeString(override.start) }
        : {}),
      ...(override.end != null
        ? { end: toPlainDateTimeString(override.end) }
        : {}),
    })),
  };
}

export function resolveOccurrenceStart(
  masterStart: EventDateTimeInput,
  occurrenceStart?: EventDateTimeInput,
): string {
  return occurrenceStart != null
    ? toPlainDateTimeString(occurrenceStart)
    : toPlainDateTimeString(masterStart);
}

export function recurrenceInputMatchesOccurrence(
  value: EventDateTimeInput,
  occurrenceStart: string,
): boolean {
  if (typeof value === "string" && !value.includes("T")) {
    return (
      Temporal.PlainDate.from(value).toString({ calendarName: "never" }) ===
      occurrenceStart.split("T")[0]
    );
  }
  return toPlainDateTimeString(value) === occurrenceStart;
}

export function compareRecurrenceInputToOccurrence(
  value: EventDateTimeInput,
  occurrenceStart: string,
): number {
  if (typeof value === "string" && !value.includes("T")) {
    return Temporal.PlainDate.compare(
      Temporal.PlainDate.from(value),
      Temporal.PlainDate.from(occurrenceStart.split("T")[0]!),
    );
  }
  return Temporal.PlainDateTime.compare(
    Temporal.PlainDateTime.from(toPlainDateTimeString(value)),
    Temporal.PlainDateTime.from(occurrenceStart),
  );
}

export function durationPreservingEnd(
  originalStart: string,
  originalEnd: string,
  nextStart: string,
): string {
  const durationMs = Temporal.PlainDateTime.from(originalStart)
    .toZonedDateTime("UTC")
    .until(Temporal.PlainDateTime.from(originalEnd).toZonedDateTime("UTC"))
    .total("milliseconds");
  return Temporal.PlainDateTime.from(nextStart)
    .toZonedDateTime("UTC")
    .add({ milliseconds: durationMs })
    .toPlainDateTime()
    .toString({ smallestUnit: "second" });
}

export function getRecurringOccurrence<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(master: TEvent, occurrenceStart: string): TEvent | null {
  const occurrenceDate = occurrenceStart.split("T")[0]!;
  let windowStart = occurrenceDate;
  let windowEnd = Temporal.PlainDate.from(occurrenceDate)
    .add({ days: 1 })
    .toString({ calendarName: "never" });

  const override = master.recurrence?.overrides?.find((candidate) =>
    recurrenceInputMatchesOccurrence(candidate.originalStart, occurrenceStart),
  );
  if (override?.start != null) {
    const overrideDate = toPlainDateTimeString(override.start).split("T")[0]!;
    windowStart = overrideDate < occurrenceDate ? overrideDate : occurrenceDate;
    const maxDate =
      overrideDate > occurrenceDate ? overrideDate : occurrenceDate;
    windowEnd = Temporal.PlainDate.from(maxDate)
      .add({ days: 1 })
      .toString({ calendarName: "never" });
  }

  const occurrences = expandRecurringEvent<TResource, TEvent>(
    master,
    windowStart,
    windowEnd,
  );
  return (
    occurrences.find(
      (occ) => (occ._occurrenceOriginalStart ?? occ.start) === occurrenceStart,
    ) ?? null
  );
}

export function makeSplitRecurringEventId(
  masterId: string,
  occurrenceStart: string,
  isTaken: (id: string) => boolean,
): string {
  const safeStart = occurrenceStart.replace(/[^0-9A-Za-z]/g, "");
  let id = `${masterId}_${safeStart}`;
  let suffix = 1;
  while (isTaken(id)) {
    id = `${masterId}_${safeStart}_${suffix}`;
    suffix++;
  }
  return id;
}

export function dropOccurrenceExceptions<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(
  recurrence: TEvent["recurrence"],
  occurrenceStart: string,
): TEvent["recurrence"] | null {
  if (!recurrence) return null;

  const rule = normalizeRecurrenceRule(recurrence);
  const exDates = (rule.exDates ?? []).filter(
    (value) => !recurrenceInputMatchesOccurrence(value, occurrenceStart),
  );
  const overrides = (rule.overrides ?? []).filter(
    (override) =>
      !recurrenceInputMatchesOccurrence(
        override.originalStart,
        occurrenceStart,
      ),
  );

  if (
    exDates.length === (rule.exDates ?? []).length &&
    overrides.length === (rule.overrides ?? []).length
  ) {
    return null;
  }

  return normalizeRecurrenceRule({
    ...rule,
    exDates,
    overrides,
  }) as TEvent["recurrence"];
}

export interface MaterializeEditInput<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  master: TEvent;
  scope: "this" | "thisAndFollowing";
  occurrence: TEvent;
  occurrenceStart: string;
  effectiveStart: string;
  effectiveEnd: string;
  normalizedUpdates: Partial<Omit<TEvent, "id">>;
  recurrenceUpdate?: TEvent["recurrence"];
  isTaken: (id: string) => boolean;
}

export interface MaterializeResult<TEvent> {
  nextMaster: TEvent;
  addedEvents: Array<TEvent>;
}

export function materializeRecurringEdit<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(input: MaterializeEditInput<TResource, TEvent>): MaterializeResult<TEvent> {
  const {
    master,
    scope,
    occurrence,
    occurrenceStart,
    effectiveStart,
    effectiveEnd,
    normalizedUpdates,
    recurrenceUpdate,
    isTaken,
  } = input;

  const rule = normalizeRecurrenceRule(master.recurrence!);

  if (scope === "this") {
    const exDates = (rule.exDates ?? []).filter(
      (value) => !recurrenceInputMatchesOccurrence(value, occurrenceStart),
    );
    const overrides = (rule.overrides ?? []).filter(
      (override) =>
        !recurrenceInputMatchesOccurrence(
          override.originalStart,
          occurrenceStart,
        ),
    );
    const overrideFields = {
      ...(normalizedUpdates as Record<string, unknown>),
    };
    delete overrideFields.recurrence;
    delete overrideFields._originalStart;
    delete overrideFields._originalEnd;
    delete overrideFields._recurringMasterId;
    delete overrideFields._occurrenceIndex;
    delete overrideFields._occurrenceOriginalStart;

    overrides.push({
      ...overrideFields,
      originalStart: occurrenceStart,
      ...(normalizedUpdates.start != null ? { start: effectiveStart } : {}),
      ...(normalizedUpdates.end != null ? { end: effectiveEnd } : {}),
    });

    const nextMaster = {
      ...master,
      recurrence: normalizeRecurrenceRule({
        ...rule,
        exDates,
        overrides,
      }),
    } as TEvent;

    return { nextMaster, addedEvents: [] };
  }

  const splitDate = occurrenceStart.split("T")[0]!;
  const oldRule = normalizeRecurrenceRule({
    ...rule,
    until: splitDate,
  });
  const remainingRule = normalizeRecurrenceRule({
    ...rule,
    ...(rule.count !== undefined && rule.until === undefined
      ? {
          count: Math.max(1, rule.count - (occurrence._occurrenceIndex ?? 0)),
        }
      : {}),
    exDates: rule.exDates?.filter(
      (value) => compareRecurrenceInputToOccurrence(value, occurrenceStart) > 0,
    ),
    overrides: rule.overrides?.filter(
      (override) =>
        compareRecurrenceInputToOccurrence(
          override.originalStart,
          occurrenceStart,
        ) > 0,
    ),
  });

  const updateFields = { ...(normalizedUpdates as Record<string, unknown>) };
  delete updateFields.recurrence;

  const splitEvent = {
    ...occurrence,
    ...updateFields,
    id: makeSplitRecurringEventId(master.id, occurrenceStart, isTaken),
    start: effectiveStart,
    end: effectiveEnd,
    recurrence:
      recurrenceUpdate != null
        ? normalizeRecurrenceRule(recurrenceUpdate)
        : remainingRule,
    _originalStart: undefined,
    _originalEnd: undefined,
    _recurringMasterId: undefined,
    _occurrenceIndex: undefined,
    _occurrenceOriginalStart: undefined,
  } as TEvent;

  const nextMaster = {
    ...master,
    recurrence: oldRule,
  } as TEvent;

  return { nextMaster, addedEvents: [splitEvent] };
}

export interface MaterializeRemoveInput<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  master: TEvent;
  scope: "this" | "thisAndFollowing";
  occurrenceStart: string;
}

export function materializeRecurringRemove<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(input: MaterializeRemoveInput<TResource, TEvent>): { nextMaster: TEvent } {
  const { master, scope, occurrenceStart } = input;
  const rule = normalizeRecurrenceRule(master.recurrence!);

  if (scope === "this") {
    const exDates = (rule.exDates ?? []).filter(
      (value) => !recurrenceInputMatchesOccurrence(value, occurrenceStart),
    );
    exDates.push(occurrenceStart);
    const overrides = (rule.overrides ?? []).filter(
      (override) =>
        !recurrenceInputMatchesOccurrence(
          override.originalStart,
          occurrenceStart,
        ),
    );
    const nextMaster = {
      ...master,
      recurrence: normalizeRecurrenceRule({
        ...rule,
        exDates,
        overrides,
      }),
    } as TEvent;
    return { nextMaster };
  }

  const nextMaster = {
    ...master,
    recurrence: normalizeRecurrenceRule({
      ...rule,
      until: occurrenceStart.split("T")[0]!,
    }),
  } as TEvent;
  return { nextMaster };
}
