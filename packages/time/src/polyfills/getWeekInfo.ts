import { getDateTimeDefaults } from '../utils/dateTimeDefaults'
import { weekInfoData } from './weekInfoData'
import type { WeekInfo } from './types'

const normalizeLocale = (loc: string) => {
  const [lang, region] = loc.split('-')
  return region ? `${lang?.toLowerCase()}-${region.toUpperCase()}` : lang?.toLowerCase()
}

const DEFAULT_WEEK_INFO: WeekInfo = {
  firstDay: 7,
  weekend: [6, 7],
  minimalDays: 1,
}

function lookupWeekInfo(localeString: string): WeekInfo {
  const normalizedLocale = normalizeLocale(localeString)

  let match: WeekInfo | undefined = weekInfoData[normalizedLocale ?? '']

  if (!match) {
    const mainLanguage = normalizedLocale?.split('-')[0]
    match = weekInfoData[mainLanguage ?? '']
  }

  if (!match) {
    match = Object.entries(weekInfoData).find(
      ([key]) => normalizeLocale(key) === normalizedLocale,
    )?.[1]
  }

  if (!match) {
    match = weekInfoData.en ?? weekInfoData['en-US'] ?? DEFAULT_WEEK_INFO
  }

  return match
}

export function getWeekInfo(locale?: string | Intl.Locale): WeekInfo {
  const localeString =
    locale == null
      ? getDateTimeDefaults().locale
      : typeof locale === 'string'
        ? locale
        : locale.toString()
  return lookupWeekInfo(localeString)
}

if (typeof Intl !== 'undefined') {
  const { prototype } = Intl.Locale
  if ('weekInfo' in prototype && typeof prototype.getWeekInfo !== 'function') {
    prototype.getWeekInfo = function () {
      return this.weekInfo
    }
  } else if (typeof prototype.getWeekInfo !== 'function') {
    prototype.getWeekInfo = function () {
      return lookupWeekInfo(this.toString())
    }
  }
}
