import { useEffect, useRef } from 'react'

export interface UseInfiniteScrollOptions {
  /**
   * Called when the **start** sentinel (top or left) enters the visible area.
   * Typically used to navigate to the previous period.
   */
  onReachStart?: () => void
  /**
   * Called when the **end** sentinel (bottom or right) enters the visible area.
   * Typically used to navigate to the next period.
   */
  onReachEnd?: () => void
  /**
   * Optional ref to an element used as the IntersectionObserver root.
   * When omitted the browser viewport is used.
   *
   * Pass the ref of your scroll container so that visibility is measured
   * relative to that container rather than the window.
   */
  root?: React.RefObject<Element | null>
  /**
   * Margin applied around the root before computing intersections.
   * Positive values extend the detection zone, negative values shrink it.
   *
   * Use a positive value (e.g. `'200px'`) to fire *before* the sentinel is
   * fully visible — good for preloading the next period early.
   *
   * @default '0px'
   */
  rootMargin?: string
  /**
   * Fraction of the sentinel element that must be visible to trigger.
   * @default 0
   */
  threshold?: number
  /**
   * Minimum milliseconds between consecutive triggers of the **same** sentinel.
   * Prevents rapid-fire navigation when the user scrolls quickly or when
   * the scroll position is reset after navigation.
   * @default 800
   */
  cooldownMs?: number
  /**
   * When `true` the observers are disconnected. Pass `true` while lazy
   * loading is in progress to avoid re-triggering navigation.
   */
  disabled?: boolean
}

/**
 * Infinite-scroll hook powered by `IntersectionObserver`.
 *
 * Place the returned `startSentinelRef` at the **top / left** of your
 * scrollable content and `endSentinelRef` at the **bottom / right**.
 * When a sentinel enters the viewport (or the provided `root` element),
 * the corresponding callback fires once per cooldown window.
 *
 * @example
 * ```tsx
 * const scrollRef = useRef<HTMLDivElement>(null)
 * const { startSentinelRef, endSentinelRef } = useInfiniteScroll({
 *   root: scrollRef,
 *   rootMargin: '100px 0px',
 *   onReachStart: calendar.goToPreviousPeriod,
 *   onReachEnd:   calendar.goToNextPeriod,
 * })
 *
 * return (
 *   <div ref={scrollRef} style={{ overflowY: 'auto', height: '600px' }}>
 *     <div ref={startSentinelRef} style={{ height: 1 }} aria-hidden />
 *     {content}
 *     <div ref={endSentinelRef}   style={{ height: 1 }} aria-hidden />
 *   </div>
 * )
 * ```
 */
export function useInfiniteScroll({
  onReachStart,
  onReachEnd,
  root,
  rootMargin = '0px',
  threshold = 0,
  cooldownMs = 800,
  disabled = false,
}: UseInfiniteScrollOptions = {}): {
  startSentinelRef: React.RefObject<HTMLDivElement | null>
  endSentinelRef: React.RefObject<HTMLDivElement | null>
} {
  const startSentinelRef = useRef<HTMLDivElement>(null)
  const endSentinelRef = useRef<HTMLDivElement>(null)

  // Keep callbacks current without needing to tear down and rebuild the observer
  const onReachStartRef = useRef(onReachStart)
  const onReachEndRef = useRef(onReachEnd)
  onReachStartRef.current = onReachStart
  onReachEndRef.current = onReachEnd

  // Per-sentinel last-fired timestamp for cooldown
  const lastFiredRef = useRef({ start: 0, end: 0 })

  useEffect(() => {
    if (disabled) return

    // Capture the root element synchronously during effect setup.
    // DOM refs are stable after mount so this is safe.
    const rootEl = root?.current ?? null

    const observer = new IntersectionObserver(
      (entries) => {
        const now = Date.now()

        for (const entry of entries) {
          if (!entry.isIntersecting) continue

          if (
            entry.target === startSentinelRef.current &&
            now - lastFiredRef.current.start >= cooldownMs
          ) {
            lastFiredRef.current.start = now
            onReachStartRef.current?.()
          } else if (
            entry.target === endSentinelRef.current &&
            now - lastFiredRef.current.end >= cooldownMs
          ) {
            lastFiredRef.current.end = now
            onReachEndRef.current?.()
          }
        }
      },
      { root: rootEl, rootMargin, threshold },
    )

    const startEl = startSentinelRef.current
    const endEl = endSentinelRef.current
    if (startEl) observer.observe(startEl)
    if (endEl) observer.observe(endEl)

    return () => observer.disconnect()
  }, [root, rootMargin, threshold, cooldownMs, disabled])

  return { startSentinelRef, endSentinelRef }
}
