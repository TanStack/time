import type { CalendarFeatureFactory } from './types'

export type CalendarFeatureList = ReadonlyArray<CalendarFeatureFactory>

export function calendarFeatures<const TFeatures extends CalendarFeatureList>(
  features: TFeatures,
): TFeatures {
  return features
}
