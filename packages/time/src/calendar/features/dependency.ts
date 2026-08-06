import { toPlainDateTimeString } from "~/date/parse";
import { dependencyModule } from "~/kernel/modules";
import { hasDependencyPath, shiftToSatisfyLink } from "~/validation/dependency";
import type { KernelEvent } from "~/kernel";
import type { DependencyApi } from "~/kernel/modules";
import type { DependencyGraphEvent } from "~/validation/dependency";
import type { DependencyType, Event, Resource, ResizeError } from "../types";
import type { CalendarFeature, CalendarHost } from "./types";

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
  DependencyCreationApi,
  "dependency"
> {
  const graphOf = (
    host: CalendarHost<TResource, TEvent>,
  ): Array<DependencyGraphEvent> => host.getEvents().map((event) => ({
      id: event.id,
      title: event.title,
      start: toPlainDateTimeString(event.start),
      end: toPlainDateTimeString(event.end),
      dependsOn: event.dependsOn,
    }));

  return {
    name: "dependency",
    module: (ctx) =>
      dependencyModule<TEvent & KernelEvent>({ timeZone: ctx.timeZone }),
    api: (host) => ({
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
