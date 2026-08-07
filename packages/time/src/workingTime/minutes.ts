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

export function mergeMinuteRanges(
  ranges: Array<MinuteRange>,
): Array<MinuteRange> {
  const sorted = ranges.slice().sort((a, b) => a.startMinutes - b.startMinutes);
  const merged: Array<MinuteRange> = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.startMinutes <= last.endMinutes) {
      last.endMinutes = Math.max(last.endMinutes, range.endMinutes);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

export function invertMinuteRanges(
  merged: Array<MinuteRange>,
): Array<MinuteRange> {
  const gaps: Array<MinuteRange> = [];
  let cursor = 0;
  for (const range of merged) {
    if (cursor < range.startMinutes) {
      gaps.push({ startMinutes: cursor, endMinutes: range.startMinutes });
    }
    cursor = range.endMinutes;
  }
  if (cursor < MINUTES_IN_DAY) {
    gaps.push({ startMinutes: cursor, endMinutes: MINUTES_IN_DAY });
  }
  return gaps;
}
