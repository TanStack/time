import { isIntentOp } from "./types";
import type { ConcreteWriteOp, KernelEvent, WriteOp } from "./types";

export function invertWriteOp<E extends KernelEvent>(
  op: ConcreteWriteOp<E>,
): ConcreteWriteOp<E> {
  if (op.kind === "add")
    return { kind: "remove", id: op.event.id, event: op.event };
  if (op.kind === "remove") return { kind: "add", event: op.event };
  return { kind: "update", id: op.id, before: op.after, after: op.before };
}

export function invertWriteOps<E extends KernelEvent>(
  ops: Array<WriteOp<E>>,
): Array<ConcreteWriteOp<E>> {
  const inverted: Array<ConcreteWriteOp<E>> = [];
  for (let i = ops.length - 1; i >= 0; i--) {
    const op = ops[i]!;
    if (isIntentOp(op)) continue;
    inverted.push(invertWriteOp(op));
  }
  return inverted;
}

export function concreteWriteOps<E extends KernelEvent>(
  ops: Array<WriteOp<E>>,
): Array<ConcreteWriteOp<E>> {
  return ops.filter((op): op is ConcreteWriteOp<E> => !isIntentOp(op));
}
