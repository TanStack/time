import { getTimeClient } from "../client";
import { calculateDeltaMinutesFromPixels } from "./getResizeProps";
import { snapToInterval } from "./getMoveProps";
import type { MoveConstraints, MoveGranularity } from "./getMoveProps";
import type { CalendarHost } from "./features";
import type {
  Event,
  EventDateTimeInput,
  EventMutationError,
  RecurrenceEditScope,
  Resource,
  SaveEventResult,
  ValidateMoveOptions,
  ValidateMoveResult,
} from "./types";

export interface MoveHost<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> extends CalendarHost<TResource, TEvent> {
  validateEventMove: (options: ValidateMoveOptions) => ValidateMoveResult;
  resolveMasterEventId: (eventId: string) => string;
  editRecurringEvent: (
    eventId: string,
    updates: Partial<Omit<TEvent, "id">>,
    options: {
      scope: RecurrenceEditScope;
      occurrenceStart?: EventDateTimeInput;
    },
  ) => Promise<SaveEventResult>;
}

export interface MoveState {
  isMoving: boolean;
  eventId: string | null;
  granularity: MoveGranularity | null;
  previewStart: string | null;
  previewEnd: string | null;
  lastValidPreviewStart: string | null;
  lastValidPreviewEnd: string | null;
  originDayDate: string | null;
  targetDayDate: string | null;
  blocked: boolean;
}

export interface MoveControllerOptions {
  enabled?: boolean;
  containerHeight?: number;
  constraints?: MoveConstraints;
  onMoveStart?: (eventId: string) => void;
  onMoveEnd?: (eventId: string, newStart: string, newEnd: string) => void;
  onRecurringMoveEnd?: (move: {
    eventId: string;
    occurrenceStart: EventDateTimeInput;
    originalStart: string;
    originalEnd: string;
    newStart: string;
    newEnd: string;
  }) => void;
  onMoveError?: (error: EventMutationError) => void;
}

export interface MoveStartArgs {
  eventId: string;
  originalStart: string;
  originalEnd: string;
  dayDate: string;
  granularity?: MoveGranularity;
  occurrenceStart?: EventDateTimeInput;
  recurrenceScope?: RecurrenceEditScope;
}

export interface MoveToArgs {
  dayDate?: string | null;
  deltaMinutes?: number;
  deltaPixels?: number;
}

export type MoveListener = () => void;

const INITIAL_MOVE_STATE: MoveState = {
  isMoving: false,
  eventId: null,
  granularity: null,
  previewStart: null,
  previewEnd: null,
  lastValidPreviewStart: null,
  lastValidPreviewEnd: null,
  originDayDate: null,
  targetDayDate: null,
  blocked: false,
};

const ERROR_THROTTLE_MS = 500;

export class MoveController<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  private _host: MoveHost<TResource, TEvent>;
  private _options: MoveControllerOptions;

  private _state: MoveState = INITIAL_MOVE_STATE;
  private _listeners = new Set<MoveListener>();

  private _original: {
    id: string;
    start: string;
    end: string;
    dayDate: string;
    granularity: MoveGranularity;
    occurrenceStart?: EventDateTimeInput;
    recurrenceScope?: RecurrenceEditScope;
  } | null = null;

  private _lastEmittedError: {
    eventId: string;
    message: string;
    timestamp: number;
  } | null = null;

  private _lastProcessed: { minuteShift: number; day: string } | null = null;

  constructor(
    host: MoveHost<TResource, TEvent>,
    options: MoveControllerOptions = {},
  ) {
    this._host = host;
    this._options = options;
  }

  subscribe = (listener: MoveListener): (() => void) => {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  };

  getSnapshot = (): MoveState => this._state;

  setOptions(options: MoveControllerOptions) {
    this._options = options;
  }

  getOptions(): MoveControllerOptions {
    return this._options;
  }

  start(args: MoveStartArgs): boolean {
    if (!(this._options.enabled ?? true)) return false;

    this._original = {
      id: args.eventId,
      start: args.originalStart,
      end: args.originalEnd,
      dayDate: args.dayDate,
      granularity: args.granularity ?? "time",
      occurrenceStart: args.occurrenceStart,
      recurrenceScope: args.recurrenceScope,
    };
    this._lastProcessed = null;
    this._lastEmittedError = null;

    this._replaceState({
      isMoving: true,
      eventId: args.eventId,
      granularity: this._original.granularity,
      previewStart: args.originalStart,
      previewEnd: args.originalEnd,
      lastValidPreviewStart: args.originalStart,
      lastValidPreviewEnd: args.originalEnd,
      originDayDate: args.dayDate,
      targetDayDate: args.dayDate,
      blocked: false,
    });

    this._options.onMoveStart?.(args.eventId);
    return true;
  }

  moveTo(args: MoveToArgs) {
    const original = this._original;
    if (!original) return;

    const constraints = this._options.constraints;
    const targetDayDate = args.dayDate ?? original.dayDate;
    const minuteShift =
      original.granularity === "day" ? 0 : this._toMinutes(args);

    const snapped = snapToInterval(
      minuteShift,
      constraints?.snapToMinutes ?? 15,
    );
    const last = this._lastProcessed;
    if (last && last.minuteShift === snapped && last.day === targetDayDate) {
      return;
    }
    this._lastProcessed = { minuteShift: snapped, day: targetDayDate };

    const validation = this._host.validateEventMove({
      eventId: original.id,
      originalStart: original.start,
      originalEnd: original.end,
      originalDayDate: original.dayDate,
      targetDayDate,
      minuteShift,
      granularity: original.granularity,
      occurrenceStart: original.occurrenceStart,
      constraints,
    });

    if (validation.blocked && validation.error) {
      this._maybeEmitError(original.id, original.start, original.end, {
        ...validation.error,
        attemptedStart: validation.result.start,
        attemptedEnd: validation.result.end,
      });
    } else {
      this._lastEmittedError = null;
    }

    const currentState = this._state;
    const previewStart = validation.blocked
      ? (currentState.lastValidPreviewStart ?? original.start)
      : validation.result.start;
    const previewEnd = validation.blocked
      ? (currentState.lastValidPreviewEnd ?? original.end)
      : validation.result.end;

    this._update({
      eventId: original.id,
      previewStart,
      previewEnd,
      ...(!validation.blocked && {
        lastValidPreviewStart: validation.result.start,
        lastValidPreviewEnd: validation.result.end,
      }),
      targetDayDate: validation.targetDayDate,
      blocked: validation.blocked,
    });
  }

  end() {
    const currentState = this._state;
    const original = this._original;

    this._original = null;
    this._lastProcessed = null;
    this._lastEmittedError = null;
    this._replaceState(INITIAL_MOVE_STATE);

    if (!original) return;
    if (!currentState.previewStart || !currentState.previewEnd) return;

    const newStart = currentState.previewStart;
    const newEnd = currentState.previewEnd;
    if (newStart === original.start && newEnd === original.end) return;

    const emitMoveEnd = () => {
      this._options.onMoveEnd?.(original.id, newStart, newEnd);
    };

    if (original.occurrenceStart != null) {
      if (!original.recurrenceScope && this._options.onRecurringMoveEnd) {
        this._options.onRecurringMoveEnd({
          eventId: original.id,
          occurrenceStart: original.occurrenceStart,
          originalStart: original.start,
          originalEnd: original.end,
          newStart,
          newEnd,
        });
        return;
      }

      void this._host
        .editRecurringEvent(
          original.id,
          { start: newStart, end: newEnd } as Partial<Omit<TEvent, "id">>,
          {
            scope: original.recurrenceScope ?? "this",
            occurrenceStart: original.occurrenceStart,
          },
        )
        .then((result) => {
          if (!result.success) {
            this._emitError({ ...result.error, kind: "move" });
            return;
          }
          emitMoveEnd();
        });
      return;
    }

    void this._host
      .editEvent(this._host.resolveMasterEventId(original.id), {
        start: newStart,
        end: newEnd,
      } as Partial<Omit<TEvent, "id">>)
      .then((result) => {
        if (!result.success) {
          this._emitError({ ...result.error, kind: "move" });
          return;
        }
        emitMoveEnd();
      });
  }

  cancel() {
    this._original = null;
    this._lastProcessed = null;
    this._lastEmittedError = null;
    this._replaceState(INITIAL_MOVE_STATE);
  }

  destroy() {
    this._listeners.clear();
    this._original = null;
    this._lastProcessed = null;
    this._lastEmittedError = null;
    this._state = INITIAL_MOVE_STATE;
  }

  private _toMinutes(args: MoveToArgs): number {
    if (args.deltaMinutes !== undefined) return args.deltaMinutes;
    if (args.deltaPixels === undefined) return 0;

    const containerHeight = this._options.containerHeight ?? 0;
    if (containerHeight === 0) return 0;
    return calculateDeltaMinutesFromPixels(args.deltaPixels, containerHeight);
  }

  private _notify() {
    for (const listener of this._listeners) listener();
  }

  private _update(patch: Partial<MoveState>) {
    this._state = { ...this._state, ...patch };
    this._notify();
  }

  private _replaceState(next: MoveState) {
    this._state = next;
    this._notify();
  }

  private _maybeEmitError(
    eventId: string,
    originalStart: string,
    originalEnd: string,
    error: NonNullable<ValidateMoveResult["error"]> & {
      attemptedStart: string;
      attemptedEnd: string;
    },
  ) {
    const now = Date.now();
    const lastError = this._lastEmittedError;
    const shouldEmit =
      !lastError ||
      lastError.eventId !== eventId ||
      lastError.message !== error.message ||
      now - lastError.timestamp > ERROR_THROTTLE_MS;
    if (!shouldEmit) return;

    const event = this._host.getEvents().find((ev) => ev.id === eventId);

    this._emitError({
      eventId,
      eventTitle: error.eventTitle ?? event?.title ?? "Unknown Event",
      kind: "move",
      reason: error.reason,
      message: error.message,
      originalStart,
      originalEnd,
      attemptedStart: error.attemptedStart,
      attemptedEnd: error.attemptedEnd,
      conflicts: error.conflicts.length > 0 ? error.conflicts : undefined,
    });

    this._lastEmittedError = {
      eventId,
      message: error.message,
      timestamp: now,
    };
  }

  private _emitError(error: EventMutationError) {
    getTimeClient().emit("event:update:error", {
      eventId: error.eventId,
      eventTitle: error.eventTitle,
      reason: error.reason,
      message: error.message,
      originalStart: error.originalStart,
      originalEnd: error.originalEnd,
      conflicts: error.conflicts,
    });

    this._options.onMoveError?.(error);
  }
}
