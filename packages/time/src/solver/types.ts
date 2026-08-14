import type { Temporal } from "@js-temporal/polyfill";
import type { DependencyType } from "~/validation/dependency";

export interface SolveEvent {
  id: string;
  start: string;
  end: string;
  manuallyScheduled?: boolean;
}

export interface SolveDependency {
  predecessorId: string;
  successorId: string;
  type: DependencyType;
  lag?: number;
}

export interface SolveRequest {
  events: Array<SolveEvent>;
  dependencies: Array<SolveDependency>;
  anchors?: Array<string>;
  timeZone: Temporal.TimeZoneLike;
}

export interface SolveConflict {
  code: "cycle" | "unsatisfiable";
  eventIds: Array<string>;
  message: string;
}

export interface SolveResult {
  events: Array<SolveEvent>;
  conflicts: Array<SolveConflict>;
}
