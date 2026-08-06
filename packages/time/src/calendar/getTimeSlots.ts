import type { TimeSlot } from "./types";

interface TimeSlotOptions {
  startHour?: number;

  endHour?: number;

  interval?: number;
}

const slotCache = new Map<string, Array<TimeSlot>>();

export function getTimeSlots(
  locale: Intl.UnicodeBCP47LocaleIdentifier,
  options?: TimeSlotOptions,
): Array<TimeSlot> {
  const { startHour = 0, endHour = 24, interval = 60 } = options ?? {};

  const cacheKey = `${locale}|${startHour}|${endHour}|${interval}`;
  const cached = slotCache.get(cacheKey);
  if (cached) return cached;

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

  slotCache.set(cacheKey, slots);
  return slots;
}
