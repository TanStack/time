import { EventClient } from "@tanstack/devtools-event-client";
import type {
  AvailabilityConflict,
  UnavailabilityReason,
} from "../calendar/types";

export interface TimeEventInfo {
  eventId: string;
  eventTitle: string;
  start: string;
  end: string;
}

export interface TimeEventMap {
  "time:event:added": TimeEventInfo;
  "time:events:set": {
    events: Array<TimeEventInfo>;
  };
  "time:event:updated": TimeEventInfo & {
    updates: Record<string, unknown>;
  };
  "time:event:removed": TimeEventInfo;
  "time:event:undo": {
    added: Array<TimeEventInfo>;
    removed: Array<TimeEventInfo>;
    updated: Array<TimeEventInfo>;
  };
  "time:event:redo": {
    added: Array<TimeEventInfo>;
    removed: Array<TimeEventInfo>;
    updated: Array<TimeEventInfo>;
  };
  "time:event:update:error": {
    eventId: string;
    eventTitle: string;
    reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
    message: string;
    originalStart: string;
    originalEnd: string;
    attemptedStart?: string;
    attemptedEnd?: string;
    conflicts?: Array<AvailabilityConflict>;
  };
  "time:calendar:navigate": {
    direction: "previous" | "next" | "current" | "specific";
    targetDate: string;
  };
  "time:calendar:viewMode:changed": {
    viewMode: {
      value: number;
      unit: string;
    };
  };
}

class TimeClient extends EventClient<TimeEventMap> {
  private static instance: TimeClient | null = null;

  private constructor() {
    super({
      pluginId: "time",
    });
  }

  static getInstance(): TimeClient {
    if (!TimeClient.instance) {
      TimeClient.instance = new TimeClient();
    }
    return TimeClient.instance;
  }
}

export function getTimeClient(): TimeClient {
  return TimeClient.getInstance();
}

export type { AvailabilityConflict, UnavailabilityReason };
