import { StageRegistry } from "./pipeline";
import {
  PROJECTION_ORDER,
  WRITE_EMIT_STAGE,
  WRITE_TRANSFORM_ORDER,
  WRITE_VALIDATE_STAGE,
} from "./types";
import type {
  KernelConfig,
  KernelDateInput,
  KernelEvent,
  Module,
  Viewport,
  WriteBatch,
  WriteCtx,
  WriteOp,
  WriteResult,
} from "./types";

function toMs(input: KernelDateInput): number {
  if (typeof input === "number") return input;
  if (input instanceof Date) return input.getTime();
  return new Date(input).getTime();
}

function overlapsViewport(event: KernelEvent, viewport: Viewport): boolean {
  return (
    toMs(event.end) >= toMs(viewport.start) &&
    toMs(event.start) <= toMs(viewport.end)
  );
}

function widen(a: Viewport | null, b: Viewport | null): Viewport | null {
  if (!a) return b;
  if (!b) return a;
  return {
    start: toMs(a.start) <= toMs(b.start) ? a.start : b.start,
    end: toMs(a.end) >= toMs(b.end) ? a.end : b.end,
  };
}

function opSpan<E extends KernelEvent>(op: WriteOp<E>): Viewport | null {
  const event =
    op.kind === "add" ? op.event : op.kind === "update" ? op.after : op.event;
  const startMs = toMs(event.start);
  const endMs = toMs(event.end);
  return {
    start: new Date(Math.min(startMs, endMs)).toISOString(),
    end: new Date(Math.max(startMs, endMs)).toISOString(),
  };
}

export interface KernelOptions<E extends KernelEvent> {
  events?: Array<E> | null;
  config?: KernelConfig;
}

export class Kernel<E extends KernelEvent> {
  private events = new Map<string, E>();
  private registry = new StageRegistry<E>();
  private modules: Array<Module<E>> = [];
  private history: Array<WriteBatch<E>> = [];
  readonly config: KernelConfig;

  constructor(options: KernelOptions<E> = {}) {
    this.config = options.config ?? {};
    for (const event of options.events ?? []) {
      this.events.set(event.id, event);
    }
  }

  use(module: Module<E>): this {
    this.modules.push(module);
    for (const contribution of module.contributions) {
      this.registry.add(contribution);
    }
    return this;
  }

  getEvents(): Array<E> {
    return [...this.events.values()];
  }

  getEvent(id: string): E | undefined {
    return this.events.get(id);
  }

  getRequiredRange(op: WriteOp<E>): Viewport {
    let range = opSpan(op);
    for (const module of this.modules) {
      if (module.getRequiredRange) {
        range = widen(range, module.getRequiredRange(op, this.config));
      }
    }
    return range ?? opSpan(op)!;
  }

  project(viewport: Viewport): Array<E> {
    let events = this.getEvents();
    for (const stageName of PROJECTION_ORDER) {
      if (stageName === "clip-to-viewport") {
        events = events.filter((event) => overlapsViewport(event, viewport));
        continue;
      }
      for (const run of this.registry.projectionStages(stageName)) {
        events = run({ events, viewport, config: this.config });
      }
    }
    return events;
  }

  write(op: WriteOp<E>): WriteResult<E> {
    const ctx = this.writeCtx();
    let batch: WriteBatch<E> = { reason: op.kind, ops: [op] };

    for (const stageName of WRITE_TRANSFORM_ORDER) {
      for (const run of this.registry.transformStages(stageName)) {
        batch = run(batch, ctx);
      }
    }

    const conflicts = this.registry
      .validateStages(WRITE_VALIDATE_STAGE)
      .flatMap((run) => run(batch, ctx));
    if (conflicts.length > 0) {
      return { status: "rejected", conflicts };
    }

    this.commit(batch);

    for (const run of this.registry.transformStages(WRITE_EMIT_STAGE)) {
      batch = run(batch, ctx);
    }

    return { status: "committed", batch };
  }

  rollback(): WriteBatch<E> | null {
    const batch = this.history.pop();
    if (!batch) return null;
    for (let i = batch.ops.length - 1; i >= 0; i--) {
      this.invert(batch.ops[i]!);
    }
    return batch;
  }

  private commit(batch: WriteBatch<E>) {
    for (const op of batch.ops) {
      this.apply(op);
    }
    this.history.push(batch);
  }

  private apply(op: WriteOp<E>) {
    if (op.kind === "add") this.events.set(op.event.id, op.event);
    else if (op.kind === "update") this.events.set(op.id, op.after);
    else this.events.delete(op.id);
  }

  private invert(op: WriteOp<E>) {
    if (op.kind === "add") this.events.delete(op.event.id);
    else if (op.kind === "update") this.events.set(op.id, op.before);
    else this.events.set(op.id, op.event);
  }

  private writeCtx(): WriteCtx<E> {
    return {
      getEvents: () => this.getEvents(),
      getEvent: (id) => this.getEvent(id),
      config: this.config,
    };
  }
}
