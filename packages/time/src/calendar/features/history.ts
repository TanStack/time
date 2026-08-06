import { getTimeClient } from "../../client";
import { redoIntent, undoIntent, undoModule } from "~/kernel/modules";
import type { InvertibleOp, KernelEvent } from "~/kernel";
import type { UndoHistory } from "~/kernel/modules";
import type { Event, Resource } from "../types";
import type { CalendarFeature } from "./types";

export interface HistoryApi {
  undo: () => void;
  redo: () => void;
}

export function historyFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  UndoHistory<TEvent & KernelEvent>,
  HistoryApi
> {
  const diff = (ops: Array<InvertibleOp<TEvent>>) => {
    const toInfo = (event: TEvent) => ({
      eventId: event.id,
      eventTitle: event.title,
      start: event.start as string,
      end: event.end as string,
    });

    const added: Array<ReturnType<typeof toInfo>> = [];
    const removed: Array<ReturnType<typeof toInfo>> = [];
    const updated: Array<ReturnType<typeof toInfo>> = [];

    for (const op of ops) {
      if (op.kind === "add") {
        added.push(toInfo(op.event));
        continue;
      }
      if (op.kind === "remove") {
        removed.push(toInfo(op.event));
        continue;
      }
      const moved =
        op.before.start !== op.after.start ||
        op.before.end !== op.after.end ||
        op.before.title !== op.after.title;
      if (moved) updated.push(toInfo(op.after));
    }

    return { added, removed, updated };
  };

  return {
    name: "history",
    module: () => undoModule<TEvent & KernelEvent>(),
    api: (host, module) => ({
      undo: () => {
        if (!module.canUndo()) return;

        const applied = host.write([undoIntent()], "history/undo");
        getTimeClient().emit("event:undo", diff(applied));
      },
      redo: () => {
        if (!module.canRedo()) return;

        const applied = host.write([redoIntent()], "history/redo");
        getTimeClient().emit("event:redo", diff(applied));
      },
    }),
  };
}
