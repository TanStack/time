import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { getTimeClient } from "@tanstack/time";
import type { TimeEventMap } from "@tanstack/time";
import type { ParentComponent } from "solid-js";

export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  type: keyof TimeEventMap;
  details: Record<string, unknown>;
}

interface CalendarEventSnapshot {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface TimeStoreState {
  activityLog: Array<ActivityLogEntry>;
  events: Record<string, CalendarEventSnapshot>;
}

interface TimeContextValue {
  state: TimeStoreState;
  clearLog: () => void;
}

const TimeContext = createContext<TimeContextValue>();

export function useTimeStore(): TimeContextValue {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error("useTimeStore must be used within an TimeProvider");
  }
  return context;
}

const MAX_LOG_ENTRIES = 100;

let entryCounter = 0;
function generateId(): string {
  entryCounter += 1;
  return `entry-${entryCounter}`;
}

const [state, setState] = createStore<TimeStoreState>({
  activityLog: [],
  events: {},
});

type TimeEventInfoPayload = {
  eventId: string;
  eventTitle: string;
  start: string;
  end: string;
};

function toSnapshot(event: TimeEventInfoPayload): CalendarEventSnapshot {
  return {
    id: event.eventId,
    title: event.eventTitle,
    start: event.start,
    end: event.end,
  };
}

function applyEvent(
  type: keyof TimeEventMap,
  payload: unknown,
  timestamp: number,
) {
  const entry: ActivityLogEntry = {
    id: generateId(),
    timestamp,
    type,
    details: payload as Record<string, unknown>,
  };

  setState("activityLog", (prev) => [entry, ...prev].slice(0, MAX_LOG_ENTRIES));

  if (type === "time:event:added" || type === "time:event:updated") {
    const event = payload as TimeEventInfoPayload;
    setState("events", event.eventId, toSnapshot(event));
    return;
  }

  if (type === "time:event:removed") {
    const { eventId } = payload as { eventId: string };
    setState("events", eventId, undefined!);
    return;
  }

  if (type === "time:event:undo" || type === "time:event:redo") {
    const { added, removed, updated } = payload as {
      added: Array<TimeEventInfoPayload>;
      removed: Array<TimeEventInfoPayload>;
      updated: Array<TimeEventInfoPayload>;
    };
    setState("events", (prev) => {
      const next = { ...prev };
      for (const event of removed) {
        delete next[event.eventId];
      }
      for (const event of [...added, ...updated]) {
        next[event.eventId] = toSnapshot(event);
      }
      return next;
    });
    return;
  }

  if (type === "time:events:set") {
    const { events } = payload as { events: Array<TimeEventInfoPayload> };
    setState("events", (prev) => {
      const next = { ...prev };
      for (const event of events) {
        next[event.eventId] = toSnapshot(event);
      }
      return next;
    });
  }
}

const client = getTimeClient();

for (const record of client.getEventHistory()) {
  applyEvent(record.type, record.payload, record.timestamp);
}

client.onAllPluginEvents((event) => {
  applyEvent(event.type, event.payload, Date.now());
});

export const TimeProvider: ParentComponent = (props) => {
  const clearLog = () => {
    setState("activityLog", []);
  };

  return (
    <TimeContext.Provider value={{ state, clearLog }}>
      {props.children}
    </TimeContext.Provider>
  );
};
