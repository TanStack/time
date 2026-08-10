---
id: AvailabilityApi
title: AvailabilityApi
---

# Interface: AvailabilityApi\<TResource, TEvent\>

Defined in: [calendar/features/availability.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L26)

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

Defined in: [calendar/features/availability.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L52)

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

Defined in: [calendar/features/availability.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L44)

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

Defined in: [calendar/features/availability.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L38)

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

Defined in: [calendar/features/availability.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L34)

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

Defined in: [calendar/features/availability.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L30)

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

Defined in: [calendar/features/availability.ts:59](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L59)

#### Parameters

##### event

###### calendarId?

`string`

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
