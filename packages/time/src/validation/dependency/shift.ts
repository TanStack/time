export type DependencyType = "FS" | "SS" | "FF" | "SF";

export interface DependencyLink {
  id: string;
  type: DependencyType;
}

export function requiredForwardShiftMs(
  type: DependencyType,
  predStartMs: number,
  predEndMs: number,
  succStartMs: number,
  succEndMs: number,
): number {
  switch (type) {
    case "FS":
      return predEndMs - succStartMs;
    case "SS":
      return predStartMs - succStartMs;
    case "FF":
      return predEndMs - succEndMs;
    case "SF":
      return predStartMs - succEndMs;
  }
}

export function requiredBackwardShiftMs(
  type: DependencyType,
  predStartMs: number,
  predEndMs: number,
  succStartMs: number,
  succEndMs: number,
): number {
  switch (type) {
    case "FS":
      return predEndMs - succStartMs;
    case "SS":
      return predStartMs - succStartMs;
    case "FF":
      return predEndMs - succEndMs;
    case "SF":
      return predStartMs - succEndMs;
  }
}
