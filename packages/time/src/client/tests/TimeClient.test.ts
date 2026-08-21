import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getTimeClient } from "../TimeClient";
import type { TimeEventInfo } from "../TimeClient";

function startFakeBus(): () => void {
  const onConnect = () => {
    window.dispatchEvent(new CustomEvent("tanstack-connect-success"));
  };
  const onDispatch = (e: Event) => {
    window.dispatchEvent(
      new CustomEvent("tanstack-devtools-global", {
        detail: (e as CustomEvent).detail,
      }),
    );
  };

  window.addEventListener("tanstack-connect", onConnect);
  window.addEventListener("tanstack-dispatch-event", onDispatch);

  return () => {
    window.removeEventListener("tanstack-connect", onConnect);
    window.removeEventListener("tanstack-dispatch-event", onDispatch);
  };
}

function eventInfo(id: string): TimeEventInfo {
  return {
    eventId: id,
    eventTitle: `Event ${id}`,
    start: "2024-01-01T09:00:00",
    end: "2024-01-01T10:00:00",
  };
}

describe("TimeClient event history", () => {
  let stopBus: () => void;

  beforeAll(() => {
    stopBus = startFakeBus();
  });

  afterAll(() => {
    stopBus();
  });

  it("retains events emitted before any subscriber attaches", () => {
    const client = getTimeClient();

    client.emit("event:added", eventInfo("a"));
    client.emit("event:removed", eventInfo("a"));

    const history = client.getEventHistory();

    expect(history.map((record) => record.type)).toEqual([
      "time:event:added",
      "time:event:removed",
    ]);
    expect(history[0]?.payload).toMatchObject({ eventId: "a" });
    expect(history[0]?.timestamp).toBeTypeOf("number");
  });

  it("lets a late subscriber replay history then follow live events", () => {
    const client = getTimeClient();

    client.emit("event:added", eventInfo("b"));

    const seen = client.getEventHistory().map((record) => record.type);
    client.onAllPluginEvents((event) => seen.push(event.type));

    client.emit("event:added", eventInfo("c"));

    expect(seen.filter((type) => type === "time:event:added")).toHaveLength(3);
    expect(seen.at(-1)).toBe("time:event:added");
  });

  it("caps history at 100 entries, keeping the most recent", () => {
    const client = getTimeClient();

    for (let i = 0; i < 120; i++) {
      client.emit("event:added", eventInfo(`bulk-${i}`));
    }

    const history = client.getEventHistory();

    expect(history).toHaveLength(100);
    expect(history.at(-1)?.payload).toMatchObject({ eventId: "bulk-119" });
  });
});
