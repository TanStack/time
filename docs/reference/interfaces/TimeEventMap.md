---
id: TimeEventMap
title: TimeEventMap
---

# Interface: TimeEventMap

Defined in: [client/TimeClient.ts:10](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L10)

Event map for TimeClient events

## Properties

### time:calendar:navigate

```ts
time:calendar:navigate: object;
```

Defined in: [client/TimeClient.ts:47](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L47)

#### direction

```ts
direction: "previous" | "next" | "current" | "specific";
```

#### targetDate

```ts
targetDate: string;
```

***

### time:calendar:viewMode:changed

```ts
time:calendar:viewMode:changed: object;
```

Defined in: [client/TimeClient.ts:51](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L51)

#### viewMode

```ts
viewMode: object;
```

##### viewMode.unit

```ts
unit: string;
```

##### viewMode.value

```ts
value: number;
```

***

### time:event:added

```ts
time:event:added: object;
```

Defined in: [client/TimeClient.ts:11](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L11)

#### end

```ts
end: string;
```

#### eventId

```ts
eventId: string;
```

#### eventTitle

```ts
eventTitle: string;
```

#### start

```ts
start: string;
```

***

### time:event:removed

```ts
time:event:removed: object;
```

Defined in: [client/TimeClient.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L24)

#### end

```ts
end: string;
```

#### eventId

```ts
eventId: string;
```

#### eventTitle

```ts
eventTitle: string;
```

#### start

```ts
start: string;
```

***

### time:event:resize:error

```ts
time:event:resize:error: object;
```

Defined in: [client/TimeClient.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L36)

#### attemptedEnd?

```ts
optional attemptedEnd: string;
```

#### attemptedStart?

```ts
optional attemptedStart: string;
```

#### conflicts?

```ts
optional conflicts: AvailabilityConflict[];
```

#### eventId

```ts
eventId: string;
```

#### eventTitle

```ts
eventTitle: string;
```

#### message

```ts
message: string;
```

#### originalEnd

```ts
originalEnd: string;
```

#### originalStart

```ts
originalStart: string;
```

#### reason

```ts
reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
```

***

### time:event:resized

```ts
time:event:resized: object;
```

Defined in: [client/TimeClient.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L30)

#### end

```ts
end: string;
```

#### eventId

```ts
eventId: string;
```

#### eventTitle

```ts
eventTitle: string;
```

#### start

```ts
start: string;
```

***

### time:event:updated

```ts
time:event:updated: object;
```

Defined in: [client/TimeClient.ts:17](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L17)

#### end

```ts
end: string;
```

#### eventId

```ts
eventId: string;
```

#### eventTitle

```ts
eventTitle: string;
```

#### start

```ts
start: string;
```

#### updates

```ts
updates: Record<string, unknown>;
```
