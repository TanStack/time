---
id: TimeEventMap
title: TimeEventMap
---

# Interface: TimeEventMap

Defined in: [client/TimeClient.ts:17](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L17)

Event map for TimeClient events

## Properties

### time:calendar:navigate

```ts
time:calendar:navigate: object;
```

Defined in: [client/TimeClient.ts:48](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L48)

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

Defined in: [client/TimeClient.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L52)

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
time:event:added: TimeEventInfo;
```

Defined in: [client/TimeClient.ts:18](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L18)

***

### time:event:redo

```ts
time:event:redo: object;
```

Defined in: [client/TimeClient.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L31)

#### added

```ts
added: TimeEventInfo[];
```

#### removed

```ts
removed: TimeEventInfo[];
```

#### updated

```ts
updated: TimeEventInfo[];
```

***

### time:event:removed

```ts
time:event:removed: TimeEventInfo;
```

Defined in: [client/TimeClient.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L25)

***

### time:event:resized

```ts
time:event:resized: TimeEventInfo;
```

Defined in: [client/TimeClient.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L36)

***

### time:event:undo

```ts
time:event:undo: object;
```

Defined in: [client/TimeClient.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L26)

#### added

```ts
added: TimeEventInfo[];
```

#### removed

```ts
removed: TimeEventInfo[];
```

#### updated

```ts
updated: TimeEventInfo[];
```

***

### time:event:update:error

```ts
time:event:update:error: object;
```

Defined in: [client/TimeClient.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L37)

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

### time:event:updated

```ts
time:event:updated: TimeEventInfo & object;
```

Defined in: [client/TimeClient.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L22)

#### Type Declaration

##### updates

```ts
updates: Record<string, unknown>;
```

***

### time:events:set

```ts
time:events:set: object;
```

Defined in: [client/TimeClient.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L19)

#### events

```ts
events: TimeEventInfo[];
```
