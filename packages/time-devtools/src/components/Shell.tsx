import {
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import {
  Button,
  Header,
  HeaderLogo,
  Input,
  JsonTree,
  MainPanel,
  Tag,
  X,
} from "@tanstack/devtools-ui";
import { useStyles } from "../styles/use-styles";
import { TimeProvider, useTimeStore } from "../store/time-context";
import type { TimeEventInfo } from "@tanstack/time";
import type { ActivityLogEntry } from "../store/time-context";

export default function Devtools() {
  return (
    <TimeProvider>
      <DevtoolsContent />
    </TimeProvider>
  );
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getEventTypeLabel = (
  type: string,
): {
  text: string;
  color:
    | "green"
    | "blue"
    | "red"
    | "yellow"
    | "purple"
    | "pink"
    | "gray"
    | "teal";
} => {
  switch (type) {
    case "time:events:set":
      return { text: "Loaded", color: "green" };
    case "time:event:added":
      return { text: "Added", color: "green" };
    case "time:event:updated":
      return { text: "Updated", color: "blue" };
    case "time:event:removed":
      return { text: "Removed", color: "red" };
    case "time:event:resized":
      return { text: "Resized", color: "yellow" };
    case "time:event:update:error":
      return { text: "Update Error", color: "red" };
    case "time:calendar:navigate":
      return { text: "Navigate", color: "purple" };
    case "time:event:undo":
      return { text: "Undo", color: "yellow" };
    case "time:event:redo":
      return { text: "Redo", color: "yellow" };
    case "time:calendar:viewMode:changed":
      return { text: "View Mode", color: "pink" };
    default:
      return { text: type, color: "gray" };
  }
};

const getEventDescription = (entry: ActivityLogEntry): string => {
  const { type, details } = entry;

  switch (type) {
    case "time:events:set":
      const evts = details.events as Array<unknown> | undefined;
      return `Batched ${evts?.length || 0} events`;
    case "time:event:added":
      return `${details.eventTitle || "Event"} (ID: ${String(details.eventId).slice(0, 8)}...)`;
    case "time:event:updated":
      return `${details.eventTitle || "Event"} - ${Object.keys(details.updates || {}).join(", ")}`;
    case "time:event:removed":
      return `${details.eventTitle || "Event"}`;
    case "time:event:resized":
      return `Resized to ${String(details.start)} - ${String(details.end)}`;
    case "time:event:update:error":
      return `${details.eventTitle || "Event"} - ${String(details.message)}`;
    case "time:event:undo": {
      const d = details as {
        added?: Array<TimeEventInfo>;
        removed?: Array<TimeEventInfo>;
        updated?: Array<TimeEventInfo>;
      };
      const parts: Array<string> = [];
      if (d.added?.length) parts.push(`${d.added.length} added`);
      if (d.removed?.length) parts.push(`${d.removed.length} removed`);
      if (d.updated?.length) parts.push(`${d.updated.length} updated`);
      return parts.length ? `Undo: ${parts.join(", ")}` : "Undo";
    }
    case "time:event:redo": {
      const d = details as {
        added?: Array<TimeEventInfo>;
        removed?: Array<TimeEventInfo>;
        updated?: Array<TimeEventInfo>;
      };
      const parts: Array<string> = [];
      if (d.added?.length) parts.push(`${d.added.length} added`);
      if (d.removed?.length) parts.push(`${d.removed.length} removed`);
      if (d.updated?.length) parts.push(`${d.updated.length} updated`);
      return parts.length ? `Redo: ${parts.join(", ")}` : "Redo";
    }
    case "time:calendar:navigate":
      return `${String(details.direction)} → ${String(details.targetDate)}`;
    case "time:calendar:viewMode:changed":
      const viewMode = details.viewMode as
        | { value?: number; unit?: string }
        | undefined;
      return `${viewMode?.value || ""} ${viewMode?.unit || ""}`;
    default:
      return "";
  }
};

function DevtoolsContent() {
  const { state, clearLog } = useTimeStore();
  const styles = useStyles();
  const [leftPanelWidth, setLeftPanelWidth] = createSignal(300);
  const [isDragging, setIsDragging] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<"log" | "events">("log");

  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [search, setSearch] = createSignal("");

  const filteredLog = createMemo(() => {
    const s = search().toLowerCase();
    return state.activityLog.filter((entry) => {
      if (!s) return true;
      return (
        entry.type.toLowerCase().includes(s) ||
        getEventDescription(entry).toLowerCase().includes(s)
      );
    });
  });

  let dragStartX = 0;
  let dragStartWidth = 0;

  const handleDragHandleDoubleClick = () => {
    setLeftPanelWidth(300);
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    dragStartX = e.clientX;
    dragStartWidth = leftPanelWidth();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;

    e.preventDefault();
    const deltaX = e.clientX - dragStartX;
    const newWidth = Math.max(150, Math.min(800, dragStartWidth + deltaX));
    setLeftPanelWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  });

  const filteredEvents = createMemo(() => {
    const s = search().toLowerCase();
    return (Object.values(state.events).filter(Boolean) as Array<any>).filter(
      (event) => {
        if (!s) return true;
        return (
          event.title.toLowerCase().includes(s) ||
          event.id.toLowerCase().includes(s)
        );
      },
    );
  });

  const selectedEntry = createMemo(() => {
    const id = selectedId();
    if (!id) return null;
    if (activeTab() === "log") {
      return state.activityLog.find((e) => e.id === id);
    }
    return state.events[id];
  });

  return (
    <MainPanel class={styles().shellRoot}>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Header>
          <HeaderLogo flavor={{ light: "#9dec48", dark: "#9dec48" }}>
            TanStack Time
          </HeaderLogo>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              "margin-left": "1.5rem",
              flex: 1,
            }}
          >
            <Show
              when={activeTab() === "log"}
              fallback={
                <Button
                  onClick={() => {
                    setActiveTab("log");
                    setSelectedId(null);
                  }}
                  variant="primary"
                  outline
                >
                  Activity
                </Button>
              }
            >
              <Button
                onClick={() => {
                  setActiveTab("log");
                  setSelectedId(null);
                }}
                variant="primary"
              >
                Activity
              </Button>
            </Show>
            <Show
              when={activeTab() === "events"}
              fallback={
                <Button
                  onClick={() => {
                    setActiveTab("events");
                    setSelectedId(null);
                  }}
                  variant="primary"
                  outline
                >
                  Events
                </Button>
              }
            >
              <Button
                onClick={() => {
                  setActiveTab("events");
                  setSelectedId(null);
                }}
                variant="primary"
              >
                Events
              </Button>
            </Show>
          </div>
        </Header>

        <div class={styles().mainContainer}>
          <div
            class={styles().leftPanel}
            style={{
              width: `${leftPanelWidth()}px`,
              "min-width": "150px",
              "max-width": "800px",
            }}
          >
            <div class={styles().searchArea}>
              <Input
                placeholder={`Filter ${
                  activeTab() === "log" ? "activity" : "events"
                }...`}
                value={search()}
                onChange={(val) => setSearch(val)}
              />
            </div>

            <Show when={activeTab() === "log"}>
              <div
                class={styles().panelHeader}
                style={{
                  display: "flex",
                  "justify-content": "space-between",
                  "align-items": "center",
                }}
              >
                <span class={styles().infoLabel}>
                  {filteredLog().length} Entries
                </span>
                <Button onClick={clearLog} variant="secondary">
                  Clear
                </Button>
              </div>
            </Show>
            <Show when={activeTab() === "events"}>
              <div
                class={styles().panelHeader}
                style={{
                  display: "flex",
                  "justify-content": "space-between",
                  "align-items": "center",
                }}
              >
                <span class={styles().infoLabel}>
                  {filteredEvents().length} Events
                </span>
              </div>
            </Show>

            <div class={styles().utilList}>
              <Show when={activeTab() === "log"}>
                <For
                  each={filteredLog()}
                  fallback={
                    <div class={styles().sectionEmpty}>No activity found.</div>
                  }
                >
                  {(entry) => {
                    const label = getEventTypeLabel(entry.type);
                    return (
                      <div
                        class={styles().utilRow}
                        classList={{
                          [styles().utilRowSelected]: selectedId() === entry.id,
                        }}
                        onClick={() => setSelectedId(entry.id)}
                      >
                        <span class={styles().stateKey}>
                          {formatTime(entry.timestamp)}
                        </span>
                        <Tag color={label.color} label={label.text} />
                        <span class={styles().utilKey}>
                          {getEventDescription(entry)}
                        </span>
                      </div>
                    );
                  }}
                </For>
              </Show>

              <Show when={activeTab() === "events"}>
                <For
                  each={filteredEvents()}
                  fallback={
                    <div class={styles().sectionEmpty}>No events found.</div>
                  }
                >
                  {(event) => (
                    <div
                      class={styles().utilRow}
                      classList={{
                        [styles().utilRowSelected]: selectedId() === event.id,
                      }}
                      onClick={() => setSelectedId(event.id)}
                    >
                      <div
                        style={{
                          display: "flex",
                          "flex-direction": "column",
                          gap: "2px",
                        }}
                      >
                        <span class={styles().utilKey}>{event.title}</span>
                        <span class={styles().stateKey}>
                          {event.start.split("T")[0]} →{" "}
                          {event.end.split("T")[0]}
                        </span>
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          </div>

          <div
            class={`${styles().dragHandle} ${isDragging() ? "dragging" : ""}`}
            onMouseDown={handleMouseDown}
            onDblClick={handleDragHandleDoubleClick}
          />

          <div class={styles().rightPanel}>
            <Show
              when={selectedEntry()}
              fallback={
                <div class={styles().noSelection}>
                  Select an item to view details
                </div>
              }
            >
              {(entry) => (
                <>
                  <div class={styles().detailsHeader}>
                    <div
                      style={{
                        display: "flex",
                        "align-items": "center",
                        gap: "8px",
                      }}
                    >
                      <Show when={activeTab() === "log"}>
                        <Tag
                          label={
                            getEventTypeLabel(
                              (entry() as ActivityLogEntry).type,
                            ).text
                          }
                          color={
                            getEventTypeLabel(
                              (entry() as ActivityLogEntry).type,
                            ).color
                          }
                        />
                      </Show>
                      <span style={{ "font-weight": 600 }}>
                        {activeTab() === "log"
                          ? (entry() as ActivityLogEntry).type
                          : (entry() as any).title}
                      </span>
                    </div>
                    <Button
                      onClick={() => setSelectedId(null)}
                      variant="secondary"
                      style={{ padding: "4px" }}
                    >
                      <X />
                    </Button>
                  </div>
                  <div class={styles().stateDetails}>
                    <div class={styles().detailsGrid}>
                      <div class={styles().detailSection}>
                        <div class={styles().detailSectionHeader}>Raw Data</div>
                        <div class={styles().stateContent}>
                          <JsonTree
                            value={
                              activeTab() === "log"
                                ? (entry() as ActivityLogEntry).details
                                : entry()
                            }
                            defaultExpansionDepth={1}
                          />
                        </div>
                      </div>

                      <Show when={activeTab() === "log"}>
                        <div class={styles().detailSection}>
                          <div class={styles().detailSectionHeader}>
                            Metadata
                          </div>
                          <div class={styles().stateContent}>
                            <JsonTree
                              value={{
                                id: (entry() as ActivityLogEntry).id,
                                timestamp: (entry() as ActivityLogEntry)
                                  .timestamp,
                                formattedTime: formatTime(
                                  (entry() as ActivityLogEntry).timestamp,
                                ),
                              }}
                            />
                          </div>
                        </div>
                      </Show>
                    </div>
                  </div>
                </>
              )}
            </Show>
          </div>
        </div>
      </div>
    </MainPanel>
  );
}
