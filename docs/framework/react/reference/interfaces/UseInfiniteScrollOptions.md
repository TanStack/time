---
id: UseInfiniteScrollOptions
title: UseInfiniteScrollOptions
---

# Interface: UseInfiniteScrollOptions

Defined in: [useInfiniteScroll.ts:3](https://github.com/TanStack/time/blob/main/packages/react-time/src/useInfiniteScroll.ts#L3)

## Properties

### cooldownMs?

```ts
optional cooldownMs: number;
```

Defined in: [useInfiniteScroll.ts:43](https://github.com/TanStack/time/blob/main/packages/react-time/src/useInfiniteScroll.ts#L43)

Minimum milliseconds between consecutive triggers of the **same** sentinel.
Prevents rapid-fire navigation when the user scrolls quickly or when
the scroll position is reset after navigation.

#### Default

```ts
800
```

***

### disabled?

```ts
optional disabled: boolean;
```

Defined in: [useInfiniteScroll.ts:48](https://github.com/TanStack/time/blob/main/packages/react-time/src/useInfiniteScroll.ts#L48)

When `true` the observers are disconnected. Pass `true` while lazy
loading is in progress to avoid re-triggering navigation.

***

### onReachEnd()?

```ts
optional onReachEnd: () => void;
```

Defined in: [useInfiniteScroll.ts:13](https://github.com/TanStack/time/blob/main/packages/react-time/src/useInfiniteScroll.ts#L13)

Called when the **end** sentinel (bottom or right) enters the visible area.
Typically used to navigate to the next period.

#### Returns

`void`

***

### onReachStart()?

```ts
optional onReachStart: () => void;
```

Defined in: [useInfiniteScroll.ts:8](https://github.com/TanStack/time/blob/main/packages/react-time/src/useInfiniteScroll.ts#L8)

Called when the **start** sentinel (top or left) enters the visible area.
Typically used to navigate to the previous period.

#### Returns

`void`

***

### root?

```ts
optional root: RefObject<Element | null>;
```

Defined in: [useInfiniteScroll.ts:21](https://github.com/TanStack/time/blob/main/packages/react-time/src/useInfiniteScroll.ts#L21)

Optional ref to an element used as the IntersectionObserver root.
When omitted the browser viewport is used.

Pass the ref of your scroll container so that visibility is measured
relative to that container rather than the window.

***

### rootMargin?

```ts
optional rootMargin: string;
```

Defined in: [useInfiniteScroll.ts:31](https://github.com/TanStack/time/blob/main/packages/react-time/src/useInfiniteScroll.ts#L31)

Margin applied around the root before computing intersections.
Positive values extend the detection zone, negative values shrink it.

Use a positive value (e.g. `'200px'`) to fire *before* the sentinel is
fully visible — good for preloading the next period early.

#### Default

```ts
'0px'
```

***

### threshold?

```ts
optional threshold: number;
```

Defined in: [useInfiniteScroll.ts:36](https://github.com/TanStack/time/blob/main/packages/react-time/src/useInfiniteScroll.ts#L36)

Fraction of the sentinel element that must be visible to trigger.

#### Default

```ts
0
```
