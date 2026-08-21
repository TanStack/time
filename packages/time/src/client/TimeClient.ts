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
  "time:event:resized": TimeEventInfo;
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

export interface TimeEventRecord {
  type: keyof TimeEventMap;
  payload: TimeEventMap[keyof TimeEventMap];
  timestamp: number;
}

const MAX_EVENT_HISTORY = 100;

class TimeClient extends EventClient<TimeEventMap> {
  private static instance: TimeClient | null = null;
  private eventHistory: Array<TimeEventRecord> = [];

  private constructor() {
    super({
      pluginId: "time",
    });

    this.onAllPluginEvents((event) => {
      this.eventHistory.push({
        type: event.type,
        payload: event.payload,
        timestamp: Date.now(),
      });
      if (this.eventHistory.length > MAX_EVENT_HISTORY) {
        this.eventHistory.splice(
          0,
          this.eventHistory.length - MAX_EVENT_HISTORY,
        );
      }
    });
  }

  static getInstance(): TimeClient {
    if (!TimeClient.instance) {
      TimeClient.instance = new TimeClient();
    }
    return TimeClient.instance;
  }

  getEventHistory(): ReadonlyArray<TimeEventRecord> {
    return this.eventHistory;
  }
}

export function getTimeClient(): TimeClient {
  return TimeClient.getInstance();
}

export type { AvailabilityConflict, UnavailabilityReason };
