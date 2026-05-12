---
id: ResizeStartArgs
title: ResizeStartArgs
---

# Interface: ResizeStartArgs

Defined in: [calendar/resizeController.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L33)

## Properties

### clientX

```ts
clientX: number;
```

Defined in: [calendar/resizeController.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L38)

***

### clientY

```ts
clientY: number;
```

Defined in: [calendar/resizeController.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L39)

***

### edge

```ts
edge: ResizeEdge;
```

Defined in: [calendar/resizeController.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L35)

***

### eventId

```ts
eventId: string;
```

Defined in: [calendar/resizeController.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L34)

***

### originalEnd

```ts
originalEnd: string;
```

Defined in: [calendar/resizeController.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L37)

***

### originalStart

```ts
originalStart: string;
```

Defined in: [calendar/resizeController.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L36)

***

### target?

```ts
optional target: HTMLElement | null;
```

Defined in: [calendar/resizeController.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L44)

Optional element under the pointer (e.g. `e.target as HTMLElement`).
Used to resolve the originating day column without `getBoundingClientRect`.
