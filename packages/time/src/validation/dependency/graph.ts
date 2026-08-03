import type { DependencyGraphEvent } from "./validateDependencies";

/** True when `fromId` reaches `toId` by following `dependsOn` links, so adding the reverse cycles. */
export function hasDependencyPath(
  events: Array<DependencyGraphEvent>,
  fromId: string,
  toId: string,
): boolean {
  const byId = new Map(events.map((event) => [event.id, event]));
  const seen = new Set<string>();
  const stack = [fromId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (currentId === toId) return true;
    if (seen.has(currentId)) continue;
    seen.add(currentId);

    for (const dep of byId.get(currentId)?.dependsOn ?? []) {
      stack.push(dep.id);
    }
  }

  return false;
}
