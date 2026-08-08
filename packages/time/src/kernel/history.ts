import { isIntentOp } from "./types";
import type { IntentOp } from "./types";

export interface Identified {
  id: string;
}

export type InvertibleOp<E extends Identified> =
  | { kind: "add"; event: E }
  | { kind: "update"; id: string; before: E; after: E }
  | { kind: "remove"; id: string; event: E };

export function invertWriteOp<E extends Identified>(
  op: InvertibleOp<E>,
): InvertibleOp<E> {
  if (op.kind === "add")
    return { kind: "remove", id: op.event.id, event: op.event };
  if (op.kind === "remove") return { kind: "add", event: op.event };
  return { kind: "update", id: op.id, before: op.after, after: op.before };
}

export function invertWriteOps<E extends Identified>(
  ops: Array<InvertibleOp<E> | IntentOp>,
): Array<InvertibleOp<E>> {
  const inverted: Array<InvertibleOp<E>> = [];
  for (let i = ops.length - 1; i >= 0; i--) {
    const op = ops[i]!;
    if (isIntentOp(op as never)) continue;
    inverted.push(invertWriteOp(op as InvertibleOp<E>));
  }
  return inverted;
}

export function concreteWriteOps<E extends Identified>(
  ops: Array<InvertibleOp<E> | IntentOp>,
): Array<InvertibleOp<E>> {
  return ops.filter((op): op is InvertibleOp<E> => !isIntentOp(op as never));
}
