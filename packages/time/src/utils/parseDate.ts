import { z } from 'zod'
import type { ZodSafeParseResult } from 'zod'

type ParseDateResult = ZodSafeParseResult<Date>

export type PossibleDate = string | number | Date

export function parseDate(date: PossibleDate): ParseDateResult {
  const schema = z
    .preprocess((val) => {
      if (val instanceof Date) return val
      if (typeof val === 'string' || typeof val === 'number') {
        const numVal = Number(val)
        if (!isNaN(numVal)) return new Date(numVal)
        return new Date(val)
      }
      return val
    }, z.date())
    .refine((d) => !isNaN(d.getTime()) && d.getTime() > 0)

  return schema.safeParse(date)
}
