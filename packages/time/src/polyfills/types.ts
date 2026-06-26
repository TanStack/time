export interface WeekInfo {
  firstDay: number;
  weekend: Array<number>;
  minimalDays: number;
}

declare global {
  // oxlint-disable-next-line no-namespace
  namespace Intl {
    interface Locale {
      getWeekInfo: () => WeekInfo;
      weekInfo?: WeekInfo;
    }
  }
}
