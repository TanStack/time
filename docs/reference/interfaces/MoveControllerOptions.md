---
id: MoveControllerOptions
title: MoveControllerOptions
---

# Interface: MoveControllerOptions

Defined in: [calendar/moveController.ts:46](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L46)

## Properties

### constraints?

```ts
optional constraints: MoveConstraints;
```

Defined in: [calendar/moveController.ts:49](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L49)

***

### containerHeight?

```ts
optional containerHeight: number;
```

Defined in: [calendar/moveController.ts:48](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L48)

***

### enabled?

```ts
optional enabled: boolean;
```

Defined in: [calendar/moveController.ts:47](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L47)

***

### onMoveEnd()?

```ts
optional onMoveEnd: (eventId, newStart, newEnd) => void;
```

Defined in: [calendar/moveController.ts:51](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L51)

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

#### Returns

`void`

***

### onMoveError()?

```ts
optional onMoveError: (error) => void;
```

Defined in: [calendar/moveController.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L60)

#### Parameters

##### error

[`EventMutationError`](EventMutationError.md)

#### Returns

`void`

***

### onMoveStart()?

```ts
optional onMoveStart: (eventId) => void;
```

Defined in: [calendar/moveController.ts:50](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L50)

#### Parameters

##### eventId

`string`

#### Returns

`void`

***

### onRecurringMoveEnd()?

```ts
optional onRecurringMoveEnd: (move) => void;
```

Defined in: [calendar/moveController.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L52)

#### Parameters

##### move

###### eventId

`string`

###### newEnd

`string`

###### newStart

`string`

###### occurrenceStart

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

###### originalEnd

`string`

###### originalStart

`string`

#### Returns

`void`
