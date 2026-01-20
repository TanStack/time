# What API methods do we need?

## Date Operations

- [x] `startOf(input: DateInput, options: StartOfOptions): DateOperationResult` ✅
- [x] `endOf(input: DateInput, options: EndOfOptions): DateOperationResult` ✅
- [x] `add(input: DateInput, options: AddOptions): DateOperationResult` ✅
- [x] `subtract(input: DateInput, options: SubtractOptions): DateOperationResult` ✅
- [x] `round(input: DateInput, options: RoundOptions): DateOperationResult` ✅

## Duration Calculations

- [x] `until(start: DateInput, end: DateInput, options: UntilOptions): number` ✅
- [x] `since(start: DateInput, end: DateInput, options: SinceOptions): number` ✅

## Comparisons

- [x] `equals(date1: DateInput, date2: DateInput, options: EqualsOptions): boolean` ✅
- [x] `isBefore(date1: DateInput, date2: DateInput, options?: IsBeforeOptions): boolean` ✅
- [x] `isAfter(date1: DateInput, date2: DateInput, options?: IsAfterOptions): boolean` ✅
- [x] `isSameOrBefore(date1: DateInput, date2: DateInput, options: IsSameOrBeforeOptions): boolean` ✅
- [x] `isSameOrAfter(date1: DateInput, date2: DateInput, options: IsSameOrAfterOptions): boolean` ✅

## Range Operations

- [x] `isBetween(date: DateInput, options: IsBetweenOptions): boolean` ✅
- [x] `intersects(date: DateInput, options: IntersectsOptions): boolean` ✅

## Type Definitions

- `DateInput = string | number | Date | Temporal.ZonedDateTime`
- `DateOperationResult` - Object with `value`, `asDate()`, `asEpoch()`, `asString()`, `asZonedDateTime()`, etc.
- `Range = { start: DateInput, end: DateInput }`

## Future Considerations

- [ ] `time(PlainTime): ZonedDateTime` (use getter/setter?)
- [x] `timeZone(IANATimeZoneId): ZonedDateTime` (use getter/setter?) ✅
- [x] `calendar(Calendar): ZonedDateTime` (use getter/setter?) ✅
