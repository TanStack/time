---
id: TimeEventMap
title: TimeEventMap
---

# Interface: TimeEventMap

Defined in: [client/TimeClient.ts:14](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L14)

## Properties

### time:calendar:navigate

```ts
time:calendar:navigate: object;
```

Defined in: [client/TimeClient.ts:45](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L45)

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

Defined in: [client/TimeClient.ts:49](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L49)

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

Defined in: [client/TimeClient.ts:15](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L15)

***

### time:event:redo

```ts
time:event:redo: object;
```

Defined in: [client/TimeClient.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L28)

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

Defined in: [client/TimeClient.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L22)

***

### time:event:resized

```ts
time:event:resized: TimeEventInfo;
```

Defined in: [client/TimeClient.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L33)

***

### time:event:undo

```ts
time:event:undo: object;
```

Defined in: [client/TimeClient.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L23)

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

Defined in: [client/TimeClient.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L34)

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

Defined in: [client/TimeClient.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L19)

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

Defined in: [client/TimeClient.ts:16](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L16)

#### events

```ts
events: TimeEventInfo[];
```
