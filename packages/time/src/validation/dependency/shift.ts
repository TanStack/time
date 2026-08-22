export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

export interface DependencyLink {
  id: string
  type: DependencyType
  lag?: number
}

const MS_PER_MINUTE = 60_000

export function lagMs(link: { lag?: number } | undefined): number {
  return (link?.lag ?? 0) * MS_PER_MINUTE
}

export function formatLagMinutes(lag: number): string {
  return `${lag < 0 ? '-' : '+'}${Math.abs(lag)}m`
}

export function requiredForwardShiftMs(
  type: DependencyType,
  predStartMs: number,
  predEndMs: number,
  succStartMs: number,
  succEndMs: number,
  lagMilliseconds = 0,
): number {
  switch (type) {
    case 'FS':
      return predEndMs + lagMilliseconds - succStartMs
    case 'SS':
      return predStartMs + lagMilliseconds - succStartMs
    case 'FF':
      return predEndMs + lagMilliseconds - succEndMs
    case 'SF':
      return predStartMs + lagMilliseconds - succEndMs
  }
}

export function requiredBackwardShiftMs(
  type: DependencyType,
  predStartMs: number,
  predEndMs: number,
  succStartMs: number,
  succEndMs: number,
  lagMilliseconds = 0,
): number {
  switch (type) {
    case 'FS':
      return predEndMs + lagMilliseconds - succStartMs
    case 'SS':
      return predStartMs + lagMilliseconds - succStartMs
    case 'FF':
      return predEndMs + lagMilliseconds - succEndMs
    case 'SF':
      return predStartMs + lagMilliseconds - succEndMs
  }
}
