---
id: AvailabilityApi
title: AvailabilityApi
---

# Interface: AvailabilityApi\<TResource, TEvent\>

Defined in: [calendar/features/availability.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L25)

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

Defined in: [calendar/features/availability.ts:51](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L51)

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

Defined in: [calendar/features/availability.ts:43](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L43)

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

Defined in: [calendar/features/availability.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L37)

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
getUnavailableMinuteRanges: (date, options?) => MinuteRange[];
```

Defined in: [calendar/features/availability.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L33)

#### Parameters

##### date

`string`

##### options?

###### resourceIds?

`TResource`\[`"id"`\][]

#### Returns

`MinuteRange`[]

***

### getUnavailableRanges()

```ts
getUnavailableRanges: (date, options?) => UnavailableRange[];
```

Defined in: [calendar/features/availability.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L29)

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

Defined in: [calendar/features/availability.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L58)

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
