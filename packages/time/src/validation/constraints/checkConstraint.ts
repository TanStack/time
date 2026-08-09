import { Temporal } from "@js-temporal/polyfill";

export type ConstraintType =
  | "start-no-earlier-than"
  | "start-no-later-than"
  | "finish-no-earlier-than"
  | "finish-no-later-than"
  | "must-start-on"
  | "must-finish-on";

export interface SchedulingConstraint {
  type: ConstraintType;
  date: string;
}

export interface ConstrainedEvent {
  id?: string;
  title: string;
  start: string;
  end: string;
  constraint?: SchedulingConstraint;
}

export interface ConstraintConflict {
  eventId: string;
  eventTitle: string;
  type: ConstraintType;
  date: string;
  anchor: "start" | "finish";
  message: string;
  start: string;
  end: string;
}

const ANCHOR: Record<ConstraintType, "start" | "finish"> = {
  "start-no-earlier-than": "start",
  "start-no-later-than": "start",
  "must-start-on": "start",
  "finish-no-earlier-than": "finish",
  "finish-no-later-than": "finish",
  "must-finish-on": "finish",
};

const REASON: Record<ConstraintType, string> = {
  "start-no-earlier-than": "cannot start before",
  "start-no-later-than": "cannot start after",
  "finish-no-earlier-than": "cannot finish before",
  "finish-no-later-than": "cannot finish after",
  "must-start-on": "must start on",
  "must-finish-on": "must finish on",
};

function isDateOnly(value: string): boolean {
  return !value.includes("T");
}

function compareCivil(anchor: string, date: string): number {
  return isDateOnly(date)
    ? Temporal.PlainDate.compare(
        Temporal.PlainDateTime.from(anchor).toPlainDate(),
        Temporal.PlainDate.from(date),
      )
    : Temporal.PlainDateTime.compare(
        Temporal.PlainDateTime.from(anchor),
        Temporal.PlainDateTime.from(date),
      );
}

function satisfies(type: ConstraintType, comparison: number): boolean {
  switch (type) {
    case "start-no-earlier-than":
    case "finish-no-earlier-than":
      return comparison >= 0;
    case "start-no-later-than":
    case "finish-no-later-than":
      return comparison <= 0;
    case "must-start-on":
    case "must-finish-on":
      return comparison === 0;
  }
}

export function checkConstraint(
  event: ConstrainedEvent,
): ConstraintConflict | null {
  const { constraint } = event;
  if (!constraint) return null;

  const anchor = ANCHOR[constraint.type];
  const anchorValue = anchor === "start" ? event.start : event.end;
  if (satisfies(constraint.type, compareCivil(anchorValue, constraint.date))) {
    return null;
  }

  return {
    eventId: event.id ?? "",
    eventTitle: event.title,
    type: constraint.type,
    date: constraint.date,
    anchor,
    message: `"${event.title}" ${REASON[constraint.type]} ${constraint.date} (${constraint.type})`,
    start: event.start,
    end: event.end,
  };
}
