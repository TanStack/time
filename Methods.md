# What API methods do we need?

[x] startOf(ZonedDateTime, unit): ZonedDateTime ✅
[x] endOf(ZonedDateTime, unit): ZonedDateTime ✅
[x] add(ZonedDateTime, duration): ZonedDateTime ✅
[x] subtract(ZonedDateTime, duration): ZonedDateTime ✅
[x] until(ZonedDateTime, ZonedDateTime): Duration ✅
[x] since(ZonedDateTime, ZonedDateTime): Duration ✅
[x] equals(ZonedDateTime, ZonedDateTime, unit): boolean ✅
[x] isBefore(ZonedDateTime, ZonedDateTime): boolean ✅
[x] isAfter(ZonedDateTime, ZonedDateTime): boolean ✅
[x] round(unit): ZonedDateTime ✅
[x] isSameOrBefore(ZonedDateTime, ZonedDateTime, unit): boolean ✅
[x] isSameOrAfter(ZonedDateTime, ZonedDateTime, unit): boolean ✅
[x] isBetween(ZonedDateTime, Range): boolean ✅
[x] intersects(ZonedDateTime, Range): boolean ✅
[ ] time(PlainTime): ZonedDateTime (use getter/setter?)
[x] timeZone(IANATimeZoneId): ZonedDateTime (use getter/setter?) ✅
[x] calendar(Calendar): ZonedDateTime (use getter/setter?) ✅
[x] asEpoch ✅
[x] asString ✅
[x] asZonedDateTime ✅
