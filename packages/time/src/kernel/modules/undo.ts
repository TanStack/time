import { concreteWriteOps, invertWriteOps } from '../history'
import type { ConcreteWriteOp, IntentOp, KernelEvent, Module, WriteBatch, WriteOp } from '../types'

const UNDO_INTENT = 'history/undo'
const REDO_INTENT = 'history/redo'

interface UndoModuleOptions {
  limit?: number
  priority?: number
}

export interface HistoryEntry<E extends KernelEvent> {
  reason: string
  ops: Array<ConcreteWriteOp<E>>
}

export interface UndoHistory<E extends KernelEvent> {
  canUndo: () => boolean
  canRedo: () => boolean
  undoStack: () => Array<HistoryEntry<E>>
  redoStack: () => Array<HistoryEntry<E>>
  clearHistory: () => void
}

export function undoIntent(): IntentOp {
  return { kind: 'intent', intent: UNDO_INTENT, payload: null }
}

export function redoIntent(): IntentOp {
  return { kind: 'intent', intent: REDO_INTENT, payload: null }
}

type Pending<E extends KernelEvent> =
  | { kind: 'undo'; entry: HistoryEntry<E> }
  | { kind: 'redo'; entry: HistoryEntry<E> }
  | null

export function undoModule<E extends KernelEvent>(
  options: UndoModuleOptions = {},
): Module<E, UndoHistory<E>> {
  const undone: Array<HistoryEntry<E>> = []
  const redone: Array<HistoryEntry<E>> = []
  let pending: Pending<E> = null

  const isHistoryIntent = (op: WriteOp<E>): op is IntentOp =>
    op.kind === 'intent' && (op.intent === UNDO_INTENT || op.intent === REDO_INTENT)

  const materialize = (batch: WriteBatch<E>): WriteBatch<E> => {
    pending = null
    if (!batch.ops.some(isHistoryIntent)) return batch

    const ops: Array<WriteOp<E>> = []

    for (const op of batch.ops) {
      if (!isHistoryIntent(op)) {
        ops.push(op)
        continue
      }

      const undoing = op.intent === UNDO_INTENT
      const entry = (undoing ? undone : redone).at(-1)
      if (!entry) continue

      pending = undoing ? { kind: 'undo', entry } : { kind: 'redo', entry }
      ops.push(...(undoing ? invertWriteOps(entry.ops) : entry.ops))
    }

    return { ...batch, ops, replay: true }
  }

  const record = (batch: WriteBatch<E>): WriteBatch<E> => {
    if (pending?.kind === 'undo') {
      undone.pop()
      redone.push(pending.entry)
    } else if (pending?.kind === 'redo') {
      redone.pop()
      undone.push(pending.entry)
    } else {
      const ops = concreteWriteOps(batch.ops)
      if (ops.length > 0) {
        undone.push({ reason: batch.reason, ops })
        redone.length = 0
        if (options.limit !== undefined && undone.length > options.limit) {
          undone.splice(0, undone.length - options.limit)
        }
      }
    }

    pending = null
    return batch
  }

  return {
    name: 'undo',
    api: () => ({
      canUndo: () => undone.length > 0,
      canRedo: () => redone.length > 0,
      undoStack: () => [...undone],
      redoStack: () => [...redone],
      clearHistory: () => {
        undone.length = 0
        redone.length = 0
        pending = null
      },
    }),
    contributions: [
      {
        pipeline: 'write',
        kind: 'transform',
        stage: 'history-materialize',
        priority: options.priority,
        run: materialize,
      },
      {
        pipeline: 'write',
        kind: 'transform',
        stage: 'emit',
        priority: options.priority,
        run: record,
      },
    ],
  }
}
