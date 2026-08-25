export type KernelDateInput = string | Date | number

export interface KernelEvent {
  id: string
  start: KernelDateInput
  end: KernelDateInput
  [key: string]: unknown
}

export interface Viewport {
  start: string
  end: string
}

export interface KernelConfig {
  [key: string]: unknown
}

export interface IntentOp {
  kind: 'intent'
  intent: string
  payload: unknown
}

export type ConcreteWriteOp<E extends KernelEvent> =
  | { kind: 'add'; event: E }
  | { kind: 'update'; id: string; before: E; after: E }
  | { kind: 'remove'; id: string; event: E }

export type WriteOp<E extends KernelEvent> = ConcreteWriteOp<E> | IntentOp

export function isIntentOp<E extends KernelEvent>(op: WriteOp<E>): op is IntentOp {
  return op.kind === 'intent'
}

export interface WriteBatch<E extends KernelEvent> {
  reason: string
  ops: Array<WriteOp<E>>

  replay?: boolean
}

export interface Conflict {
  code: string
  message: string
  eventIds: Array<string>
  [key: string]: unknown
}

export type WriteResult<E extends KernelEvent> =
  | { status: 'committed'; batch: WriteBatch<E> }
  | { status: 'rejected'; conflicts: Array<Conflict> }

export interface ProjectionCtx<E extends KernelEvent> {
  events: Array<E>
  viewport: Viewport
  config: KernelConfig
}

export interface WriteCtx<E extends KernelEvent> {
  getEvents: () => Array<E>
  getEvent: (id: string) => E | undefined
  config: KernelConfig
}

export type ProjectionStage<E extends KernelEvent> = (ctx: ProjectionCtx<E>) => Array<E>

export type TransformStage<E extends KernelEvent> = (
  batch: WriteBatch<E>,
  ctx: WriteCtx<E>,
) => WriteBatch<E>

export type ValidateStage<E extends KernelEvent> = (
  batch: WriteBatch<E>,
  ctx: WriteCtx<E>,
) => Array<Conflict>

export type ProjectionStageName = 'recurrence-expand' | 'clip-to-viewport' | 'filter' | 'layout'

export type WriteTransformStageName =
  | 'history-materialize'
  | 'resize-materialize'
  | 'recurrence-materialize'
  | 'schedule'
  | 'emit'

export type WriteValidateStageName =
  | 'availability-validate'
  | 'constraint-validate'
  | 'duration-validate'
  | 'dependency-validate'

export type ProjectionModuleStageName = Exclude<ProjectionStageName, 'clip-to-viewport'>

export const PROJECTION_ORDER: ReadonlyArray<ProjectionStageName> = [
  'recurrence-expand',
  'clip-to-viewport',
  'filter',
  'layout',
]

export const WRITE_TRANSFORM_ORDER: ReadonlyArray<WriteTransformStageName> = [
  'history-materialize',
  'resize-materialize',
  'recurrence-materialize',
  'schedule',
]

export const WRITE_EMIT_STAGE: WriteTransformStageName = 'emit'

export const WRITE_VALIDATE_ORDER: ReadonlyArray<WriteValidateStageName> = [
  'availability-validate',
  'constraint-validate',
  'duration-validate',
  'dependency-validate',
]

export type Contribution<E extends KernelEvent> =
  | {
      pipeline: 'projection'
      stage: ProjectionModuleStageName
      priority?: number
      run: ProjectionStage<E>
    }
  | {
      pipeline: 'write'
      kind: 'transform'
      stage: WriteTransformStageName
      priority?: number
      run: TransformStage<E>
    }
  | {
      pipeline: 'write'
      kind: 'validate'
      stage: WriteValidateStageName
      priority?: number
      run: ValidateStage<E>
    }

export type RangeExtender<E extends KernelEvent> = (
  op: WriteOp<E>,
  config: KernelConfig,
) => Viewport | null

export interface ModuleApiCtx<E extends KernelEvent> {
  write: (input: WriteOp<E> | Array<WriteOp<E>>, reason?: string) => WriteResult<E>
  project: (viewport: Viewport) => Array<E>
  getEvents: () => Array<E>
  getEvent: (id: string) => E | undefined
  config: KernelConfig
}

export interface Module<E extends KernelEvent, TApi = object> {
  name: string
  contributions: Array<Contribution<E>>
  requires?: ReadonlyArray<string>
  getRequiredRange?: RangeExtender<E>
  api?: (ctx: ModuleApiCtx<E>) => TApi
}

export type ModuleApi<TModule> = TModule extends {
  api?: (...args: Array<never>) => infer TApi
}
  ? TApi
  : object

type UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (value: TUnion) => void : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never

export type ComposedApi<TModules> = UnionToIntersection<
  { [K in keyof TModules]: ModuleApi<TModules[K]> }[keyof TModules]
>
