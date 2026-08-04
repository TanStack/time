export type KernelDateInput = string | Date | number;

export interface KernelEvent {
  id: string;
  start: KernelDateInput;
  end: KernelDateInput;
  [key: string]: unknown;
}

export interface Viewport {
  start: string;
  end: string;
}

export interface KernelConfig {
  [key: string]: unknown;
}

export interface IntentOp {
  kind: "intent";
  intent: string;
  payload: unknown;
}

export type ConcreteWriteOp<E extends KernelEvent> =
  | { kind: "add"; event: E }
  | { kind: "update"; id: string; before: E; after: E }
  | { kind: "remove"; id: string; event: E };

export type WriteOp<E extends KernelEvent> = ConcreteWriteOp<E> | IntentOp;

export function isIntentOp<E extends KernelEvent>(
  op: WriteOp<E>,
): op is IntentOp {
  return op.kind === "intent";
}

export interface WriteBatch<E extends KernelEvent> {
  reason: string;
  ops: Array<WriteOp<E>>;
  /**
   * Set by a module replaying recorded ops. The kernel then skips the remaining transform and
   * validate stages: the ops already describe a state this kernel committed once, so
   * re-deriving cascades from them would double-apply.
   */
  replay?: boolean;
}

export interface Conflict {
  code: string;
  message: string;
  eventIds: Array<string>;
  [key: string]: unknown;
}

export type WriteResult<E extends KernelEvent> =
  | { status: "committed"; batch: WriteBatch<E> }
  | { status: "rejected"; conflicts: Array<Conflict> };

export interface ProjectionCtx<E extends KernelEvent> {
  events: Array<E>;
  viewport: Viewport;
  config: KernelConfig;
}

export interface WriteCtx<E extends KernelEvent> {
  getEvents: () => Array<E>;
  getEvent: (id: string) => E | undefined;
  config: KernelConfig;
}

export type ProjectionStage<E extends KernelEvent> = (
  ctx: ProjectionCtx<E>,
) => Array<E>;

export type TransformStage<E extends KernelEvent> = (
  batch: WriteBatch<E>,
  ctx: WriteCtx<E>,
) => WriteBatch<E>;

export type ValidateStage<E extends KernelEvent> = (
  batch: WriteBatch<E>,
  ctx: WriteCtx<E>,
) => Array<Conflict>;

export type ProjectionStageName =
  | "recurrence-expand"
  | "clip-to-viewport"
  | "layout";

export type WriteTransformStageName =
  | "history-materialize"
  | "resize-materialize"
  | "recurrence-materialize"
  | "schedule"
  | "emit";

export type WriteValidateStageName = "availability-validate";

export type ProjectionModuleStageName = Exclude<
  ProjectionStageName,
  "clip-to-viewport"
>;

export const PROJECTION_ORDER: ReadonlyArray<ProjectionStageName> = [
  "recurrence-expand",
  "clip-to-viewport",
  "layout",
];

export const WRITE_TRANSFORM_ORDER: ReadonlyArray<WriteTransformStageName> = [
  "history-materialize",
  "resize-materialize",
  "recurrence-materialize",
  "schedule",
];

export const WRITE_EMIT_STAGE: WriteTransformStageName = "emit";

export const WRITE_VALIDATE_STAGE: WriteValidateStageName =
  "availability-validate";

export type Contribution<E extends KernelEvent> =
  | {
      pipeline: "projection";
      stage: ProjectionModuleStageName;
      priority?: number;
      run: ProjectionStage<E>;
    }
  | {
      pipeline: "write";
      kind: "transform";
      stage: WriteTransformStageName;
      priority?: number;
      run: TransformStage<E>;
    }
  | {
      pipeline: "write";
      kind: "validate";
      stage: WriteValidateStageName;
      priority?: number;
      run: ValidateStage<E>;
    };

export type RangeExtender<E extends KernelEvent> = (
  op: WriteOp<E>,
  config: KernelConfig,
) => Viewport | null;

export interface Module<E extends KernelEvent> {
  name: string;
  contributions: Array<Contribution<E>>;
  getRequiredRange?: RangeExtender<E>;
}
