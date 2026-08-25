import { invertWriteOp } from './history'
import { StageRegistry } from './pipeline'
import {
  isIntentOp,
  PROJECTION_ORDER,
  WRITE_EMIT_STAGE,
  WRITE_TRANSFORM_ORDER,
  WRITE_VALIDATE_ORDER,
} from './types'
import type {
  ComposedApi,
  ConcreteWriteOp,
  KernelConfig,
  KernelDateInput,
  KernelEvent,
  Module,
  ModuleApiCtx,
  Viewport,
  WriteBatch,
  WriteCtx,
  WriteOp,
  WriteResult,
} from './types'

function toMs(input: KernelDateInput): number {
  if (typeof input === 'number') return input
  if (input instanceof Date) return input.getTime()
  return new Date(input).getTime()
}

function overlapsViewport(event: KernelEvent, viewport: Viewport): boolean {
  return toMs(event.end) >= toMs(viewport.start) && toMs(event.start) <= toMs(viewport.end)
}

function widen(a: Viewport | null, b: Viewport | null): Viewport | null {
  if (!a) return b
  if (!b) return a
  return {
    start: toMs(a.start) <= toMs(b.start) ? a.start : b.start,
    end: toMs(a.end) >= toMs(b.end) ? a.end : b.end,
  }
}

function opSpan<E extends KernelEvent>(op: WriteOp<E>): Viewport | null {
  if (isIntentOp(op)) return null
  const event = op.kind === 'add' ? op.event : op.kind === 'update' ? op.after : op.event
  const startMs = toMs(event.start)
  const endMs = toMs(event.end)
  return {
    start: new Date(Math.min(startMs, endMs)).toISOString(),
    end: new Date(Math.max(startMs, endMs)).toISOString(),
  }
}

export interface KernelOptions<E extends KernelEvent> {
  events?: Array<E> | null
  config?: KernelConfig
}

interface CreateKernelOptions<
  TEvents extends KernelEvent,
  TModules extends Record<string, Module<TEvents, unknown>>,
> {
  events?: Array<NoInfer<TEvents>> | null
  config?: KernelConfig
  modules: TModules & Record<string, Module<TEvents, unknown>>
}

export function createKernel<
  TEvents extends KernelEvent,
  TModules extends Record<string, Module<TEvents, unknown>>,
>(options: CreateKernelOptions<TEvents, TModules>): Kernel<TEvents, ComposedApi<TModules>> {
  const kernel = new Kernel<TEvents, ComposedApi<TModules>>({
    events: options.events,
    config: options.config,
  })
  return kernel.use(...Object.values(options.modules))
}

export class Kernel<E extends KernelEvent, TApi = Record<string, unknown>> {
  private events = new Map<string, E>()
  private registry = new StageRegistry<E>()
  private modules: Array<Module<E, unknown>> = []
  private history: Array<WriteBatch<E>> = []
  readonly config: KernelConfig
  readonly api = {} as TApi

  constructor(options: KernelOptions<E> = {}) {
    this.config = options.config ?? {}
    for (const event of options.events ?? []) {
      this.events.set(event.id, event)
    }
  }

  use(...modules: Array<Module<E, unknown>>): this {
    for (const module of modules) {
      this.modules.push(module)
      for (const contribution of module.contributions) {
        this.registry.add(contribution)
      }
    }
    for (const module of modules) {
      this.mergeApi(module)
    }
    this.assertRequires()
    return this
  }

  load(events: Array<E>, options: { replace?: boolean } = {}): void {
    if (options.replace) this.events.clear()
    for (const event of events) {
      this.events.set(event.id, event)
    }
  }

  getEvents(): Array<E> {
    return [...this.events.values()]
  }

  getEvent(id: string): E | undefined {
    return this.events.get(id)
  }

  getRequiredRange(op: WriteOp<E>): Viewport | null {
    let range = opSpan(op)
    for (const module of this.modules) {
      if (module.getRequiredRange) {
        range = widen(range, module.getRequiredRange(op, this.config))
      }
    }
    return range
  }

  project(viewport: Viewport): Array<E> {
    let events = this.getEvents()
    for (const stageName of PROJECTION_ORDER) {
      if (stageName === 'clip-to-viewport') {
        events = events.filter((event) => overlapsViewport(event, viewport))
        continue
      }
      for (const run of this.registry.projectionStages(stageName)) {
        events = run({ events, viewport, config: this.config })
      }
    }
    return events
  }

  write(input: WriteOp<E> | Array<WriteOp<E>>, reason?: string): WriteResult<E> {
    const ops = Array.isArray(input) ? input : [input]
    const first = ops[0]
    const ctx = this.writeCtx()
    let batch: WriteBatch<E> = {
      reason:
        reason ?? (first === undefined ? 'empty' : isIntentOp(first) ? first.intent : first.kind),
      ops,
    }

    for (const stageName of WRITE_TRANSFORM_ORDER) {
      if (batch.replay) break
      for (const run of this.registry.transformStages(stageName)) {
        batch = run(batch, ctx)
        if (batch.replay) break
      }
    }

    const unresolved = batch.ops.filter(isIntentOp)
    if (unresolved.length > 0) {
      throw new Error(
        `Kernel: unresolved intent op(s) after the write transform stages: ${unresolved
          .map((o) => o.intent)
          .join(', ')}. Register a module that expands them.`,
      )
    }

    if (!batch.replay) {
      const conflicts = WRITE_VALIDATE_ORDER.flatMap((stageName) =>
        this.registry.validateStages(stageName).flatMap((run) => run(batch, ctx)),
      )
      if (conflicts.length > 0) {
        return { status: 'rejected', conflicts }
      }
    }

    this.commit(batch)

    for (const run of this.registry.transformStages(WRITE_EMIT_STAGE)) {
      batch = run(batch, ctx)
    }

    return { status: 'committed', batch }
  }

  rollback(): WriteBatch<E> | null {
    const batch = this.history.pop()
    if (!batch) return null
    for (let i = batch.ops.length - 1; i >= 0; i--) {
      const op = batch.ops[i]!
      if (isIntentOp(op)) continue
      this.invert(op)
    }
    return batch
  }

  private commit(batch: WriteBatch<E>) {
    for (const op of batch.ops) {
      if (isIntentOp(op)) continue
      this.apply(op)
    }
    this.history.push(batch)
  }

  private apply(op: ConcreteWriteOp<E>) {
    if (op.kind === 'add') this.events.set(op.event.id, op.event)
    else if (op.kind === 'update') this.events.set(op.id, op.after)
    else this.events.delete(op.id)
  }

  private invert(op: ConcreteWriteOp<E>) {
    this.apply(invertWriteOp(op))
  }

  private writeCtx(): WriteCtx<E> {
    return {
      getEvents: () => this.getEvents(),
      getEvent: (id) => this.getEvent(id),
      config: this.config,
    }
  }

  private apiCtx(): ModuleApiCtx<E> {
    return {
      write: (input, reason) => this.write(input, reason),
      project: (viewport) => this.project(viewport),
      getEvents: () => this.getEvents(),
      getEvent: (id) => this.getEvent(id),
      config: this.config,
    }
  }

  private mergeApi(module: Module<E, unknown>) {
    const contributed = module.api?.(this.apiCtx())
    if (!contributed) return

    const api = this.api as Record<string, unknown>
    for (const [key, value] of Object.entries(contributed)) {
      if (key in api) {
        throw new Error(
          `Kernel: module "${module.name}" contributes api "${key}", which another mounted module already contributes. Rename one of them.`,
        )
      }
      api[key] = value
    }
  }

  private assertRequires() {
    const mounted = new Set(this.modules.map((module) => module.name))
    for (const module of this.modules) {
      const missing = (module.requires ?? []).filter((name) => !mounted.has(name))
      if (missing.length > 0) {
        throw new Error(
          `Kernel: module "${module.name}" requires ${missing
            .map((name) => `"${name}"`)
            .join(', ')}, which ${missing.length === 1 ? 'is' : 'are'} not mounted.`,
        )
      }
    }
  }
}
