---
id: WorkingTimeApi
title: WorkingTimeApi
---

# Interface: WorkingTimeApi\<TResource\>

Defined in: [calendar/features/workingTime.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L22)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

## Properties

### getEffectiveCalendar()

```ts
getEffectiveCalendar: (target?) => string | undefined;
```

Defined in: [calendar/features/workingTime.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L23)

#### Parameters

##### target?

[`WorkingTimeTarget`](WorkingTimeTarget.md)\<`TResource`\>

#### Returns

`string` \| `undefined`

***

### getNonWorkingMinutes()

```ts
getNonWorkingMinutes: (date, target?) => MinuteRange[];
```

Defined in: [calendar/features/workingTime.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L34)

#### Parameters

##### date

`string`

##### target?

[`WorkingTimeTarget`](WorkingTimeTarget.md)\<`TResource`\>

#### Returns

`MinuteRange`[]

***

### getWorkingIntervals()

```ts
getWorkingIntervals: (range, target?) => WorkingTimeRange[];
```

Defined in: [calendar/features/workingTime.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L26)

#### Parameters

##### range

[`WorkingTimeRange`](WorkingTimeRange.md)

##### target?

[`WorkingTimeTarget`](WorkingTimeTarget.md)\<`TResource`\>

#### Returns

[`WorkingTimeRange`](WorkingTimeRange.md)[]

***

### getWorkingMinutes()

```ts
getWorkingMinutes: (date, target?) => MinuteRange[];
```

Defined in: [calendar/features/workingTime.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L30)

#### Parameters

##### date

`string`

##### target?

[`WorkingTimeTarget`](WorkingTimeTarget.md)\<`TResource`\>

#### Returns

`MinuteRange`[]

***

### isWorkingTime()

```ts
isWorkingTime: (range, target?) => boolean;
```

Defined in: [calendar/features/workingTime.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L38)

#### Parameters

##### range

[`WorkingTimeRange`](WorkingTimeRange.md)

##### target?

[`WorkingTimeTarget`](WorkingTimeTarget.md)\<`TResource`\>

#### Returns

`boolean`
