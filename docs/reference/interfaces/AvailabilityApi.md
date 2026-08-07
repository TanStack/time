---
id: AvailabilityApi
title: AvailabilityApi
---

# Interface: AvailabilityApi\<TResource, TEvent\>

Defined in: [calendar/features/availability.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L27)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### checkEventAvailability()

```ts
checkEventAvailability: (event, newStart, newEnd, newResources?, newConsumption?) => AvailabilityConflict | null;
```

Defined in: [calendar/features/availability.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L53)

#### Parameters

##### event

`TEvent`

##### newStart

`string`

##### newEnd

`string`

##### newResources?

(`string` \| `TResource`)[]

##### newConsumption?

`number`[]

#### Returns

`AvailabilityConflict` \| `null`

***

### getDaySpanConflicts()

```ts
getDaySpanConflicts: (options) => AvailabilityConflict[];
```

Defined in: [calendar/features/availability.ts:45](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L45)

#### Parameters

##### options

###### date

`string`

###### endMinutes

`number`

###### event?

`TEvent`

###### eventId

`string`

###### resourceIds

`TResource`\[`"id"`\][]

###### startMinutes

`number`

#### Returns

`AvailabilityConflict`[]

***

### getUnavailabilityDetails()

```ts
getUnavailabilityDetails: (date, startMinutes, endMinutes, options?) => UnavailabilityDetail[];
```

Defined in: [calendar/features/availability.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L39)

#### Parameters

##### date

`string`

##### startMinutes

`number`

##### endMinutes

`number`

##### options?

###### resourceIds?

`TResource`\[`"id"`\][]

#### Returns

[`UnavailabilityDetail`](UnavailabilityDetail.md)[]

***

### getUnavailableMinuteRanges()

```ts
getUnavailableMinuteRanges: (date, options?) => UnavailableTimeRange[];
```

Defined in: [calendar/features/availability.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L35)

#### Parameters

##### date

`string`

##### options?

###### resourceIds?

`TResource`\[`"id"`\][]

#### Returns

[`UnavailableTimeRange`](UnavailableTimeRange.md)[]

***

### getUnavailableRanges()

```ts
getUnavailableRanges: (date, options?) => UnavailableRange[];
```

Defined in: [calendar/features/availability.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L31)

#### Parameters

##### date

`string`

##### options?

###### resourceIds?

`TResource`\[`"id"`\][]

#### Returns

[`UnavailableRange`](UnavailableRange.md)[]

***

### validateEventPlacement()

```ts
validateEventPlacement: (event) => object;
```

Defined in: [calendar/features/availability.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L60)

#### Parameters

##### event

###### consumption?

`number`[]

###### end

`string`

###### id?

`string`

###### resources?

(`string` \| `TResource`)[]

###### start

`string`

###### title

`string`

#### Returns

`object`

##### blocked

```ts
blocked: boolean;
```

##### message?

```ts
optional message: string;
```
