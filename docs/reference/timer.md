---
title: Timer
id: timer
---

# Timer

```ts
export class Timer extends TimeCore<TimerState> implements TimerActions {
  constructor(options: TimerOptions);
}
```

The Timer class provides functionality for managing a countdown timer, including starting, stopping, and resetting the timer. It also includes the ability to trigger a callback when the timer finishes.


## Parameters

- `initialTime: number`
The initial time for the timer, specified in seconds.
- `onFinished?: () => void`
An optional callback function that is called when the timer finishes.
- `timeZone?: Temporal.TimeZoneLike`
Optional time zone specification for the timer. Defaults to the system's time zone.
- `onStart?: () => void`
Optional callback function that is called when the timer starts.
- `onStop?: () => void`
Optional callback function that is called when the timer stops.
- `onReset?: () => void`
Optional callback function that is called when the timer resets.


## Methods

- `start(): void`
Starts the timer.
- `stop(): void`
Stops the timer.
- `reset(): void`
Resets the timer to the initial time.


## Example Usage

```ts
import { Timer } from '@tanstack/time';

const timer = new Timer({
  initialTime: 60, // 60 seconds
  onFinished: () => {
    console.log('Timer finished!');
  },
  timeZone: 'America/New_York',
});

// Start the timer
timer.start();
```