---
id: useInfiniteScroll
title: useInfiniteScroll
---

# Function: useInfiniteScroll()

```ts
function useInfiniteScroll(__namedParameters): object;
```

Defined in: [useInfiniteScroll.ts:78](https://github.com/TanStack/time/blob/main/packages/react-time/src/useInfiniteScroll.ts#L78)

Infinite-scroll hook powered by `IntersectionObserver`.

Place the returned `startSentinelRef` at the **top / left** of your
scrollable content and `endSentinelRef` at the **bottom / right**.
When a sentinel enters the viewport (or the provided `root` element),
the corresponding callback fires once per cooldown window.

## Parameters

### \_\_namedParameters

[`UseInfiniteScrollOptions`](../interfaces/UseInfiniteScrollOptions.md) = `{}`

## Returns

`object`

### endSentinelRef

```ts
endSentinelRef: RefObject<HTMLDivElement | null>;
```

### startSentinelRef

```ts
startSentinelRef: RefObject<HTMLDivElement | null>;
```

## Example

```tsx
const scrollRef = useRef<HTMLDivElement>(null)
const { startSentinelRef, endSentinelRef } = useInfiniteScroll({
  root: scrollRef,
  rootMargin: '100px 0px',
  onReachStart: calendar.goToPreviousPeriod,
  onReachEnd:   calendar.goToNextPeriod,
})

return (
  <div ref={scrollRef} style={{ overflowY: 'auto', height: '600px' }}>
    <div ref={startSentinelRef} style={{ height: 1 }} aria-hidden />
    {content}
    <div ref={endSentinelRef}   style={{ height: 1 }} aria-hidden />
  </div>
)
```
