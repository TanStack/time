import { Temporal } from "@js-temporal/polyfill";
import { requiredForwardShiftMs, type DependencyLink } from "./shift";

export interface DependencyGraphEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  dependsOn?: Array<DependencyLink>;
}

export interface DependencyTargetEvent {
  id?: string;
  title: string;
  start: string;
  end: string;
}

export interface ValidateDependenciesInput {
  event: DependencyTargetEvent;
  dependsOn: Array<DependencyLink>;
  events: Array<DependencyGraphEvent>;
  timeZone: Temporal.TimeZoneLike;
}

export interface DependencyConflict {
  eventId: string;
  eventTitle: string;
  predecessorId: string;
  predecessorTitle: string;
  type: DependencyLink["type"];
  message: string;
  originalStart: string;
  originalEnd: string;
}

const REASON: Record<DependencyLink["type"], string> = {
  FS: "cannot start before ",
  SS: "cannot start before ",
  FF: "cannot end before ",
  SF: "cannot end before ",
};

const ANCHOR: Record<DependencyLink["type"], string> = {
  FS: " ends",
  SS: " starts",
  FF: " ends",
  SF: " starts",
};

export function validateDependencies(
  input: ValidateDependenciesInput,
): Array<DependencyConflict> {
  const { event, dependsOn, events, timeZone } = input;
  if (events.length === 0) return [];

  const byId = new Map(events.map((e) => [e.id, e]));

  const newStartMs = Temporal.PlainDateTime.from(event.start).toZonedDateTime(
    timeZone,
  ).epochMilliseconds;
  const newEndMs = Temporal.PlainDateTime.from(event.end).toZonedDateTime(
    timeZone,
  ).epochMilliseconds;

  for (const dep of dependsOn) {
    const pred = byId.get(dep.id);
    if (!pred) continue;

    const predStartMs = Temporal.PlainDateTime.from(pred.start).toZonedDateTime(
      timeZone,
    ).epochMilliseconds;
    const predEndMs = Temporal.PlainDateTime.from(pred.end).toZonedDateTime(
      timeZone,
    ).epochMilliseconds;

    const shortfall = requiredForwardShiftMs(
      dep.type,
      predStartMs,
      predEndMs,
      newStartMs,
      newEndMs,
    );

    if (shortfall > 0) {
      const reason = `${REASON[dep.type]}"${pred.title}"${ANCHOR[dep.type]}`;
      return [
        {
          eventId: event.id ?? "",
          eventTitle: event.title,
          predecessorId: pred.id,
          predecessorTitle: pred.title,
          type: dep.type,
          message: `"${event.title}" ${reason} (${dep.type})`,
          originalStart: event.start,
          originalEnd: event.end,
        },
      ];
    }
  }

  return [];
}
