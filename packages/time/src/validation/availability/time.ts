export const MINUTES_IN_DAY = 24 * 60;

export interface MinuteRange {
  startMinutes: number;
  endMinutes: number;
}

export function parseHmToMinutes(hm: string): number {
  const h = (hm.charCodeAt(0) - 48) * 10 + (hm.charCodeAt(1) - 48);
  const mi = (hm.charCodeAt(3) - 48) * 10 + (hm.charCodeAt(4) - 48);
  return h * 60 + mi;
}

export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function getWeekday(date: string): number {
  const iso = date.slice(0, 10);
  const y = +iso.slice(0, 4);
  const m = +iso.slice(5, 7);
  const d = +iso.slice(8, 10);
  const jsDow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return jsDow === 0 ? 7 : jsDow;
}

export interface ResourceDayAvailability {
  available: Array<MinuteRange>;
  unavailable: Array<MinuteRange>;
  hasAvailability: boolean;
  slotsForWeekday: Array<MinuteRange>;
}

export interface AvailabilitySlotInput {
  weekdays: Array<number>;
  startTime: string;
  endTime: string;
}

export function resourceDayAvail(
  availability: Array<AvailabilitySlotInput> | undefined,
  weekday: number,
): ResourceDayAvailability {
  const slotsForWeekday: Array<MinuteRange> = [];
  if (availability) {
    for (const slot of availability) {
      if (!slot.weekdays.includes(weekday)) continue;
      slotsForWeekday.push({
        startMinutes: parseHmToMinutes(slot.startTime),
        endMinutes: parseHmToMinutes(slot.endTime),
      });
    }
  }

  slotsForWeekday.sort((a, b) => a.startMinutes - b.startMinutes);
  const available: Array<MinuteRange> = [];
  for (const r of slotsForWeekday) {
    const last = available[available.length - 1];
    if (last && r.startMinutes <= last.endMinutes) {
      last.endMinutes = Math.max(last.endMinutes, r.endMinutes);
    } else {
      available.push({ ...r });
    }
  }

  const unavailable: Array<MinuteRange> = [];
  let cursor = 0;
  for (const a of available) {
    if (cursor < a.startMinutes) {
      unavailable.push({ startMinutes: cursor, endMinutes: a.startMinutes });
    }
    cursor = a.endMinutes;
  }
  if (cursor < MINUTES_IN_DAY) {
    unavailable.push({ startMinutes: cursor, endMinutes: MINUTES_IN_DAY });
  }

  return {
    available,
    unavailable,
    hasAvailability: !!availability,
    slotsForWeekday,
  };
}
