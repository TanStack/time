import { createContext, onCleanup, onMount, useContext } from "solid-js";
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

interface TimeStoreState {
  activityLog: Array<ActivityLogEntry>;
  events: Record<
    string,
    { id: string; title: string; start: string; end: string }
  >;
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

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const TimeProvider: ParentComponent = (props) => {
  const [state, setState] = createStore<TimeStoreState>({
    activityLog: [],
    events: {},
  });

  const clearLog = () => {
    setState("activityLog", []);
  };

  onMount(() => {
    const client = getTimeClient();

    const unsubscribe = client.onAllPluginEvents((event) => {
      const entry: ActivityLogEntry = {
        id: generateId(),
        timestamp: Date.now(),
        type: event.type,
        details: event.payload as unknown as Record<string, unknown>,
      };

      setState("activityLog", (prev) => [entry, ...prev].slice(0, 100));

      if (
        event.type === "time:event:added" ||
        event.type === "time:event:updated"
      ) {
        const payload = event.payload as {
          eventId: string;
          eventTitle: string;
          start: string;
          end: string;
        };
        setState("events", payload.eventId, {
          id: payload.eventId,
          title: payload.eventTitle,
          start: payload.start,
          end: payload.end,
        });
      } else if (event.type === "time:event:removed") {
        const payload = event.payload as { eventId: string };
        setState("events", payload.eventId, undefined!);
      } else if (
        event.type === "time:event:undo" ||
        event.type === "time:event:redo"
      ) {
        const payload = event.payload as {
          added: Array<{
            eventId: string;
            eventTitle: string;
            start: string;
            end: string;
          }>;
          removed: Array<{
            eventId: string;
            eventTitle: string;
            start: string;
            end: string;
          }>;
          updated: Array<{
            eventId: string;
            eventTitle: string;
            start: string;
            end: string;
          }>;
        };
        setState("events", (prev) => {
          const next = { ...prev };
          for (const ev of payload.removed) {
            delete next[ev.eventId];
          }
          for (const ev of [...payload.added, ...payload.updated]) {
            next[ev.eventId] = {
              id: ev.eventId,
              title: ev.eventTitle,
              start: ev.start,
              end: ev.end,
            };
          }
          return next;
        });
      } else if (event.type === "time:events:set") {
        const payload = event.payload as {
          events: Array<{
            eventId: string;
            eventTitle: string;
            start: string;
            end: string;
          }>;
        };
        setState("events", (prev) => {
          const next = { ...prev };
          for (const ev of payload.events) {
            next[ev.eventId] = {
              id: ev.eventId,
              title: ev.eventTitle,
              start: ev.start,
              end: ev.end,
            };
          }
          return next;
        });
      }
    });

    onCleanup(() => {
      unsubscribe();
      setState("events", {});
    });
  });

  const contextValue: TimeContextValue = {
    state,
    clearLog,
  };

  return (
    <TimeContext.Provider value={contextValue}>
      {props.children}
    </TimeContext.Provider>
  );
};
