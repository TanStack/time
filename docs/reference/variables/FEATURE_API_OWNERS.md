---
id: FEATURE_API_OWNERS
title: FEATURE_API_OWNERS
---

# Variable: FEATURE\_API\_OWNERS

```ts
const FEATURE_API_OWNERS: object;
```

Defined in: [calendar/features/registry.ts:77](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L77)

## Type Declaration

### canRedo

```ts
readonly canRedo: "historyFeature" = "historyFeature";
```

### canUndo

```ts
readonly canUndo: "historyFeature" = "historyFeature";
```

### checkEventAvailability

```ts
readonly checkEventAvailability: "resourceAvailabilityFeature" = "resourceAvailabilityFeature";
```

### createDependency

```ts
readonly createDependency: "eventDependencyFeature" = "eventDependencyFeature";
```

### createResizeController

```ts
readonly createResizeController: "eventResizeFeature" = "eventResizeFeature";
```

### editRecurringEvent

```ts
readonly editRecurringEvent: "eventRecurrenceFeature" = "eventRecurrenceFeature";
```

### findViolatedDependency

```ts
readonly findViolatedDependency: "eventDependencyFeature" = "eventDependencyFeature";
```

### getAffectedByDelta

```ts
readonly getAffectedByDelta: "eventDependencyFeature" = "eventDependencyFeature";
```

### getDaySpanConflicts

```ts
readonly getDaySpanConflicts: "resourceAvailabilityFeature" = "resourceAvailabilityFeature";
```

### getDependentShifts

```ts
readonly getDependentShifts: "eventDependencyFeature" = "eventDependencyFeature";
```

### getEffectiveCalendar

```ts
readonly getEffectiveCalendar: "workingTimeFeature" = "workingTimeFeature";
```

### getEventProps

```ts
readonly getEventProps: "dayEventLayoutFeature" = "dayEventLayoutFeature";
```

### getEventsByResource

```ts
readonly getEventsByResource: "timelineFeature" = "timelineFeature";
```

### getEventSegmentInfo

```ts
readonly getEventSegmentInfo: "eventResizeFeature" = "eventResizeFeature";
```

### getMasterEvent

```ts
readonly getMasterEvent: "eventRecurrenceFeature" = "eventRecurrenceFeature";
```

### getNonWorkingMinutes

```ts
readonly getNonWorkingMinutes: "workingTimeFeature" = "workingTimeFeature";
```

### getPredecessorShifts

```ts
readonly getPredecessorShifts: "eventDependencyFeature" = "eventDependencyFeature";
```

### getTimelineLayout

```ts
readonly getTimelineLayout: "timelineFeature" = "timelineFeature";
```

### getUnavailabilityDetails

```ts
readonly getUnavailabilityDetails: "resourceAvailabilityFeature" = "resourceAvailabilityFeature";
```

### getUnavailableMinuteRanges

```ts
readonly getUnavailableMinuteRanges: "resourceAvailabilityFeature" = "resourceAvailabilityFeature";
```

### getUnavailableRanges

```ts
readonly getUnavailableRanges: "resourceAvailabilityFeature" = "resourceAvailabilityFeature";
```

### getWorkingIntervals

```ts
readonly getWorkingIntervals: "workingTimeFeature" = "workingTimeFeature";
```

### getWorkingMinutes

```ts
readonly getWorkingMinutes: "workingTimeFeature" = "workingTimeFeature";
```

### goToNextOccurrence

```ts
readonly goToNextOccurrence: "eventRecurrenceFeature" = "eventRecurrenceFeature";
```

### goToPreviousOccurrence

```ts
readonly goToPreviousOccurrence: "eventRecurrenceFeature" = "eventRecurrenceFeature";
```

### isWorkingTime

```ts
readonly isWorkingTime: "workingTimeFeature" = "workingTimeFeature";
```

### redo

```ts
readonly redo: "historyFeature" = "historyFeature";
```

### removeRecurringEvent

```ts
readonly removeRecurringEvent: "eventRecurrenceFeature" = "eventRecurrenceFeature";
```

### resolveOccurrence

```ts
readonly resolveOccurrence: "eventRecurrenceFeature" = "eventRecurrenceFeature";
```

### undo

```ts
readonly undo: "historyFeature" = "historyFeature";
```

### validateEventDependencies

```ts
readonly validateEventDependencies: "eventDependencyFeature" = "eventDependencyFeature";
```

### validateEventPlacement

```ts
readonly validateEventPlacement: "resourceAvailabilityFeature" = "resourceAvailabilityFeature";
```

### validateResize

```ts
readonly validateResize: "eventResizeFeature" = "eventResizeFeature";
```
