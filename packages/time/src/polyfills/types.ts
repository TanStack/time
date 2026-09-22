export interface WeekInfo {
  firstDay: number
  weekend: Array<number>
  minimalDays: number
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Intl {
    interface Locale {
      getWeekInfo: () => WeekInfo
      weekInfo?: WeekInfo
    }
  }
}
