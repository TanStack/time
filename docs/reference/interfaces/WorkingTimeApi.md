---
id: WorkingTimeApi
title: WorkingTimeApi
---

# Interface: WorkingTimeApi\<TResource\>

Defined in: [calendar/features/workingTime.ts:18](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L18)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

## Properties

### getEffectiveCalendar()

```ts
getEffectiveCalendar: (target?) => string | undefined;
```

Defined in: [calendar/features/workingTime.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L19)

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

Defined in: [calendar/features/workingTime.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L25)

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

Defined in: [calendar/features/workingTime.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L20)

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

Defined in: [calendar/features/workingTime.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L24)

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

Defined in: [calendar/features/workingTime.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L26)

#### Parameters

##### range

[`WorkingTimeRange`](WorkingTimeRange.md)

##### target?

[`WorkingTimeTarget`](WorkingTimeTarget.md)\<`TResource`\>

#### Returns

`boolean`
