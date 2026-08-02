---
id: BuildDaysInput
title: BuildDaysInput
---

# Interface: BuildDaysInput\<E\>

Defined in: [projection/bucketByDay.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/projection/bucketByDay.ts#L39)

## Type Parameters

### E

`E` *extends* [`SplittableEvent`](SplittableEvent.md)

## Properties

### events

```ts
events: E[];
```

Defined in: [projection/bucketByDay.ts:41](https://github.com/TanStack/time/blob/main/packages/time/src/projection/bucketByDay.ts#L41)

***

### isInCurrentPeriod()?

```ts
optional isInCurrentPeriod: (isoDate) => boolean;
```

Defined in: [projection/bucketByDay.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/projection/bucketByDay.ts#L44)

#### Parameters

##### isoDate

`string`

#### Returns

`boolean`

***

### isoDates

```ts
isoDates: string[];
```

Defined in: [projection/bucketByDay.ts:40](https://github.com/TanStack/time/blob/main/packages/time/src/projection/bucketByDay.ts#L40)

***

### timeZone

```ts
timeZone: TimeZoneLike;
```

Defined in: [projection/bucketByDay.ts:42](https://github.com/TanStack/time/blob/main/packages/time/src/projection/bucketByDay.ts#L42)

***

### today?

```ts
optional today: string;
```

Defined in: [projection/bucketByDay.ts:43](https://github.com/TanStack/time/blob/main/packages/time/src/projection/bucketByDay.ts#L43)
