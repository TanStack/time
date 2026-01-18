import type { WeekInfo } from "./types";

const normalizeLocale = (loc: string) => {
  const [lang, region] = loc.split('-')
  return region ? `${lang?.toLowerCase()}-${region.toUpperCase()}` : lang?.toLowerCase()
}

;(function () {
  if ('weekInfo' in Intl.Locale.prototype && typeof Intl.Locale.prototype.getWeekInfo !== 'function') {
    Intl.Locale.prototype.getWeekInfo = function () {
      return this.weekInfo
    }
  }

  if (typeof Intl.Locale.prototype.getWeekInfo !== 'function') {
    import('./weekInfoData').then(({ weekInfoData }) => {
      Intl.Locale.prototype.getWeekInfo = function () {
        const locale = this.toString()
        const normalizedLocale = normalizeLocale(locale)

        let match: WeekInfo | undefined = weekInfoData[normalizedLocale ?? '']

        if (!match) {
          const mainLanguage = normalizedLocale?.split('-')[0]
          match = weekInfoData[mainLanguage ?? '']
        }

        if (!match) {
          match = Object.entries(weekInfoData).find(([key]) => 
            normalizeLocale(key) === normalizedLocale
          )?.[1]
        }

        return match
      }
    })
  }
})()