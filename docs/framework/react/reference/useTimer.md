---
title: Use Timer
id: useTimer
---

### useTimer

```ts
export function useTimer({
  initialTime: number,
  onFinished?: () => void,
  timeZone?: Temporal.TimeZoneLike,
  onStart?: () => void,
  onStop?: () => void,
  onReset?: () => void,
}): TimerApi;
```

`useTimer` is a hook that provides a comprehensive set of functionalities for managing a countdown timer, including starting, stopping, and resetting the timer. It also includes the ability to trigger a callback when the timer finishes, starts, stops, or resets.


#### Parameters

- `initialTime: number`
The initial time for the timer, specified in seconds.
- `timeZone?: Temporal.TimeZoneLike`
Optional time zone specification for the timer. Defaults to the system's time zone.
- `onFinished?: () => void`
An optional callback function that is called when the timer finishes.
- `onStart?: () => void`
Optional callback function that is called when the timer starts.
- `onStop?: () => void`
Optional callback function that is called when the timer stops.
- `onReset?: () => void`
Optional callback function that is called when the timer resets.


#### Returns

- `remainingTime: number`
This value represents the remaining time of the timer in seconds.
- `isRunning: boolean`
This value represents whether the timer is currently running.
- `start: () => void`
This function starts the timer.
- `stop: () => void`
This function stops the timer.
- `reset: () => void`
This function resets the timer to the initial time.


#### Example Usage

```ts
import { useTimer } from '@tanstack/react-time';

const TimerComponent = () => {
  const { remainingTime, isRunning, start, stop, reset } = useTimer({
    initialTime: 60,
    onFinished: () => {
      console.log('Timer finished!');
    },
    timeZone: 'America/New_York',
  });

  return (
    <div>
      <div>Remaining Time: {remainingTime}</div>
      <div>Is Running: {isRunning ? 'Yes' : 'No'}</div>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};
```
