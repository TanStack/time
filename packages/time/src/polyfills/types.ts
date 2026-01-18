export interface WeekInfo {
  firstDay: number
  weekend: number[]
  minimalDays: number
}

declare global {
  namespace Intl {
    interface Locale {
      getWeekInfo(): WeekInfo;
      weekInfo?: WeekInfo;
    }
  }
}
