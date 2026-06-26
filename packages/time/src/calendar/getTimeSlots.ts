import type { TimeSlot } from "./types";

interface TimeSlotOptions {
  /** Start hour (0-23). Default: 0 */
  startHour?: number;
  /** End hour (0-24). Default: 24 */
  endHour?: number;
  /** Interval in minutes. Default: 60 */
  interval?: number;
}
/**
 * Generates time slots for calendar day views.
 * Returns an array of time slots with labels formatted according to the locale.
 *
 * @param locale - The locale to use for formatting time labels (BCP 47 format)
 * @param options - Configuration options for time slots
 * @returns Array of time slots with hour, minute, and formatted label
 */
export function getTimeSlots(
  locale: Intl.UnicodeBCP47LocaleIdentifier,
  options?: TimeSlotOptions,
): Array<TimeSlot> {
  const { startHour = 0, endHour = 24, interval = 60 } = options ?? {};

  const slots: Array<TimeSlot> = [];
  const totalMinutes = (endHour - startHour) * 60;
  const numSlots = Math.floor(totalMinutes / interval);

  const formatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  });

  for (let i = 0; i < numSlots; i++) {
    const totalMinutesFromStart = startHour * 60 + i * interval;
    const hour = Math.floor(totalMinutesFromStart / 60);
    const minute = totalMinutesFromStart % 60;

    if (hour >= 24) break;

    const date = new Date(2024, 0, 1, hour, minute);
    const label = formatter.format(date);

    slots.push({
      hour,
      minute,
      label,
    });
  }

  return slots;
}
