import { useCallback, useEffect, useRef } from "react";

export interface UseInfiniteScrollOptions {
  /**
   * Called when the **start** sentinel (top or left) enters the visible area.
   * Typically used to navigate to the previous period.
   */
  onReachStart?: () => void;
  /**
   * Called when the **end** sentinel (bottom or right) enters the visible area.
   * Typically used to navigate to the next period.
   */
  onReachEnd?: () => void;
  /**
   * Optional ref to an element used as the IntersectionObserver root.
   * When omitted the browser viewport is used.
   *
   * Pass the ref of your scroll container so that visibility is measured
   * relative to that container rather than the window.
   */
  root?: React.RefObject<Element | null>;
  /**
   * Margin applied around the root before computing intersections.
   * Positive values extend the detection zone, negative values shrink it.
   *
   * Use a positive value (e.g. `'200px'`) to fire *before* the sentinel is
   * fully visible — good for preloading the next period early.
   *
   * @default '0px'
   */
  rootMargin?: string;
  /**
   * Fraction of the sentinel element that must be visible to trigger.
   * @default 0
   */
  threshold?: number;
  /**
   * Minimum milliseconds between consecutive triggers of the **same** sentinel.
   * Prevents rapid-fire navigation when the user scrolls quickly or when
   * the scroll position is reset after navigation.
   * @default 800
   */
  cooldownMs?: number;
  /**
   * When `true` the observers are disconnected. Pass `true` while lazy
   * loading is in progress to avoid re-triggering navigation.
   */
  disabled?: boolean;
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
  rootMargin = "0px",
  threshold = 0,
  cooldownMs = 800,
  disabled = false,
}: UseInfiniteScrollOptions = {}): {
  startSentinelRef: React.RefObject<HTMLDivElement | null>;
  endSentinelRef: React.RefObject<HTMLDivElement | null>;
  markProgrammaticScroll: () => void;
} {
  const startSentinelRef = useRef<HTMLDivElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);

  // Keep callbacks current without needing to tear down and rebuild the observer
  const onReachStartRef = useRef(onReachStart);
  const onReachEndRef = useRef(onReachEnd);
  onReachStartRef.current = onReachStart;
  onReachEndRef.current = onReachEnd;

  // Per-sentinel last-fired timestamp for cooldown
  const lastFiredRef = useRef({ start: 0, end: 0 });

  // Start armed so an already-visible sentinel (e.g. a short month that
  // doesn't overflow its container) can trigger a load before any real
  // scroll happens. `markProgrammaticScroll` disarms after our own
  // scroll adjustments, so the loop-prevention below still holds.
  // Each sentinel has its own flag so one direction firing doesn't steal
  // the other's turn when both are intersecting in the same batch.
  const armedRef = useRef({ start: true, end: true });
  const expectedOffsetRef = useRef<{ top: number; left: number } | null>(null);

  // Bounds the number of automatic (non-user-scroll) retries used to keep
  // filling a container that doesn't yet overflow (e.g. the handler bailed
  // out because a fetch was still pending, or a short month didn't produce
  // enough content to scroll). Once the container overflows, or this cap is
  // hit, control reverts to real user scrolling.
  const autoFillAttemptsRef = useRef({ start: 0, end: 0 });
  const MAX_AUTO_FILL_ATTEMPTS = 12;

  const markProgrammaticScroll = useCallback(() => {
    armedRef.current = { start: false, end: false };
    const el = root?.current ?? null;
    expectedOffsetRef.current = el
      ? { top: el.scrollTop, left: el.scrollLeft }
      : null;
  }, [root]);

  useEffect(() => {
    if (disabled) return;

    // Capture the root element synchronously during effect setup.
    // DOM refs are stable after mount so this is safe.
    const rootEl = root?.current ?? null;

    const pendingTimeouts: Array<ReturnType<typeof setTimeout>> = [];

    // True while the container has no scrollable overflow at all, meaning
    // the user has no way to produce a real scroll event. In that state we
    // keep automatically retrying (bounded by MAX_AUTO_FILL_ATTEMPTS) instead
    // of permanently stalling on a one-shot trigger that a still-pending
    // fetch or a short page may have wasted.
    const containerNeedsFill = () =>
      rootEl != null &&
      rootEl.scrollHeight <= rootEl.clientHeight &&
      rootEl.scrollWidth <= rootEl.clientWidth;

    const scheduleRedeliver = (
      sentinelRef: React.RefObject<HTMLDivElement | null>,
      direction: "start" | "end",
    ) => {
      const tid = setTimeout(() => {
        const el = sentinelRef.current;
        if (!el) return;
        if (
          containerNeedsFill() &&
          autoFillAttemptsRef.current[direction] < MAX_AUTO_FILL_ATTEMPTS
        ) {
          autoFillAttemptsRef.current[direction] += 1;
          armedRef.current[direction] = true;
        }
        observer.unobserve(el);
        observer.observe(el);
      }, cooldownMs + 50);
      pendingTimeouts.push(tid);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const now = Date.now();

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          if (
            entry.target === startSentinelRef.current &&
            armedRef.current.start &&
            now - lastFiredRef.current.start >= cooldownMs
          ) {
            lastFiredRef.current.start = now;
            armedRef.current.start = false;
            onReachStartRef.current?.();
            scheduleRedeliver(startSentinelRef, "start");
          } else if (
            entry.target === endSentinelRef.current &&
            armedRef.current.end &&
            now - lastFiredRef.current.end >= cooldownMs
          ) {
            lastFiredRef.current.end = now;
            armedRef.current.end = false;
            onReachEndRef.current?.();
            scheduleRedeliver(endSentinelRef, "end");
          }
        }
      },
      { root: rootEl, rootMargin, threshold },
    );

    const startEl = startSentinelRef.current;
    const endEl = endSentinelRef.current;
    if (startEl) observer.observe(startEl);
    if (endEl) observer.observe(endEl);

    const redeliver = () => {
      for (const el of [startSentinelRef.current, endSentinelRef.current]) {
        if (!el) continue;
        observer.unobserve(el);
        observer.observe(el);
      }
    };

    const onScroll = () => {
      const expected = expectedOffsetRef.current;
      expectedOffsetRef.current = null;
      if (
        rootEl &&
        expected &&
        expected.top === rootEl.scrollTop &&
        expected.left === rootEl.scrollLeft
      ) {
        return;
      }
      if (armedRef.current.start && armedRef.current.end) return;
      // A genuine user scroll always gets a fresh budget of auto-fill retries.
      autoFillAttemptsRef.current = { start: 0, end: 0 };
      armedRef.current = { start: true, end: true };
      redeliver();
    };

    const scrollTarget: EventTarget = rootEl ?? window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener("scroll", onScroll);
      pendingTimeouts.forEach(clearTimeout);
    };
  }, [root, rootMargin, threshold, cooldownMs, disabled]);

  return { startSentinelRef, endSentinelRef, markProgrammaticScroll };
}
