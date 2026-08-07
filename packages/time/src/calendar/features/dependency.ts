import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";
import { dependencyModule } from "~/kernel/modules";
import {
  computeCascade,
  hasDependencyPath,
  propagateToDependents,
  propagateToPredecessors,
  requiredForwardShiftMs,
  shiftToSatisfyLink,
} from "~/validation/dependency";
import type { KernelEvent } from "~/kernel";
import type { DependencyApi } from "~/kernel/modules";
import type { DependencyGraphEvent } from "~/validation/dependency";
import type {
  DependencyType,
  Event,
  EventDependency,
  Resource,
  ResizeError,
} from "../types";
import type { CalendarFeature, CalendarHost } from "./types";

export interface DependencyShift<TEvent> {
  event: TEvent;
  newStart: string;
  newEnd: string;
}

export interface DependencyGraphApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  getPredecessorShifts: (
    eventId: string,
    newStart: string,
    newEnd: string,
  ) => Array<DependencyShift<TEvent>>;
  getDependentShifts: (
    eventId: string,
    newStart: string,
    newEnd: string,
  ) => Array<DependencyShift<TEvent>>;
  getAffectedByDelta: (
    eventId: string,
    deltaMs: number,
  ) => Array<DependencyShift<TEvent>>;
  findViolatedDependency: (
    event: TEvent,
    proposedStartMs: number,
    proposedEndMs: number,
  ) => { dependency: EventDependency; predecessor: TEvent } | null;
}

export interface DependencyCreationApi {
  createDependency: (
    sourceId: string,
    targetId: string,
    type?: DependencyType,
  ) => { blocked: boolean; error?: ResizeError };
}

export function eventDependencyFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  DependencyApi,
  DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>,
  "dependency"
> {
  const epochMs = (
    host: CalendarHost<TResource, TEvent>,
    value: string,
  ): number =>
    Temporal.PlainDateTime.from(value).toZonedDateTime(
      host.getOptions().timeZone,
    ).epochMilliseconds;

  const resolveShifts = (
    host: CalendarHost<TResource, TEvent>,
    shifts: Array<{ id: string; newStart: string; newEnd: string }>,
  ): Array<DependencyShift<TEvent>> => {
    const resolved: Array<DependencyShift<TEvent>> = [];
    for (const shift of shifts) {
      const event = host.getEvent(shift.id);
      if (!event) continue;
      resolved.push({ event, newStart: shift.newStart, newEnd: shift.newEnd });
    }
    return resolved;
  };

  const graphOf = (
    host: CalendarHost<TResource, TEvent>,
    override?: { id: string; start: string; end: string },
  ): Array<DependencyGraphEvent> => host.getEvents().map((event) => ({
      id: event.id,
      title: event.title,
      start:
        override?.id === event.id
          ? override.start
          : toPlainDateTimeString(event.start),
      end:
        override?.id === event.id
          ? override.end
          : toPlainDateTimeString(event.end),
      dependsOn: event.dependsOn,
    }));

  return {
    name: "dependency",
    module: (ctx) =>
      dependencyModule<TEvent & KernelEvent>({ timeZone: ctx.timeZone }),
    api: (host, module) => ({
      validateEventDependencies: (event, dependsOn) =>
        module.validateEventDependencies(event, dependsOn),
      getPredecessorShifts: (eventId, newStart, newEnd) =>
        resolveShifts(
          host,
          propagateToPredecessors({
            sourceId: eventId,
            events: graphOf(host, {
              id: eventId,
              start: newStart,
              end: newEnd,
            }),
            timeZone: host.getOptions().timeZone,
            visited: new Set([eventId]),
          }),
        ),
      getDependentShifts: (eventId, newStart, newEnd) =>
        resolveShifts(
          host,
          propagateToDependents({
            sourceId: eventId,
            events: graphOf(host, {
              id: eventId,
              start: newStart,
              end: newEnd,
            }),
            timeZone: host.getOptions().timeZone,
            visited: new Set([eventId]),
          }),
        ),
      getAffectedByDelta: (eventId, deltaMs) =>
        resolveShifts(
          host,
          computeCascade({
            sourceId: eventId,
            deltaMs,
            events: graphOf(host),
            timeZone: host.getOptions().timeZone,
            visited: new Set([eventId]),
          }),
        ),
      findViolatedDependency: (event, proposedStartMs, proposedEndMs) => {
        for (const dependency of event.dependsOn ?? []) {
          const predecessor = host.getEvent(dependency.id);
          if (!predecessor) continue;

          const shortfall = requiredForwardShiftMs(
            dependency.type,
            epochMs(host, toPlainDateTimeString(predecessor.start)),
            epochMs(host, toPlainDateTimeString(predecessor.end)),
            proposedStartMs,
            proposedEndMs,
          );
          if (shortfall > 0) return { dependency, predecessor };
        }
        return null;
      },
      createDependency: (sourceId, targetId, type = "FS") => {
        const sourceEvent = host.getEvent(sourceId);
        const targetEvent = host.getEvent(targetId);
        if (!sourceEvent || !targetEvent) return { blocked: false };

        const currentDeps = targetEvent.dependsOn ?? [];
        if (currentDeps.some((d) => d.id === sourceId && d.type === type)) {
          return { blocked: false };
        }

        const targetStartStr = toPlainDateTimeString(targetEvent.start);
        const targetEndStr = toPlainDateTimeString(targetEvent.end);

        const cycle = (message: string) => ({
          blocked: true,
          error: {
            eventId: targetId,
            eventTitle: targetEvent.title,
            reason: "blocked" as const,
            message,
            originalStart: targetStartStr,
            originalEnd: targetEndStr,
          },
        });

        if (sourceId === targetId) {
          return cycle("circular dependency: an event cannot depend on itself");
        }

        if (hasDependencyPath(graphOf(host), sourceId, targetId)) {
          return cycle(
            `circular dependency: ${sourceId} already depends on ${targetId} (directly or indirectly)`,
          );
        }

        const rescheduled = shiftToSatisfyLink({
          type,
          predecessor: {
            start: toPlainDateTimeString(sourceEvent.start),
            end: toPlainDateTimeString(sourceEvent.end),
          },
          successor: { start: targetStartStr, end: targetEndStr },
          timeZone: host.getOptions().timeZone,
        });

        if (rescheduled) {
          const validation = host.validateMove(
            targetId,
            rescheduled.start,
            rescheduled.end,
          );
          if (validation.blocked) {
            return {
              blocked: true,
              error: {
                eventId: targetId,
                eventTitle: validation.blockedEventTitle ?? targetEvent.title,
                reason: "unavailable-time",
                message:
                  validation.message ??
                  `Cannot connect (${type}): the resulting schedule would fall in unavailable time.`,
                originalStart: targetStartStr,
                originalEnd: targetEndStr,
                attemptedStart: rescheduled.start,
                attemptedEnd: rescheduled.end,
              },
            };
          }
        }

        host.commitUpdate(targetId, {
          dependsOn: [...currentDeps, { id: sourceId, type }],
          ...(rescheduled && {
            start: rescheduled.start,
            end: rescheduled.end,
          }),
        } as Partial<Omit<TEvent, "id">>);

        return { blocked: false };
      },
    }),
  };
}
