---
id: TimeEventMap
title: TimeEventMap
---

# Interface: TimeEventMap

Defined in: [client/TimeClient.ts:11](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L11)

## Properties

### time:calendar:navigate

```ts
time:calendar:navigate: object;
```

Defined in: [client/TimeClient.ts:42](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L42)

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

Defined in: [client/TimeClient.ts:46](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L46)

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

Defined in: [client/TimeClient.ts:12](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L12)

***

### time:event:redo

```ts
time:event:redo: object;
```

Defined in: [client/TimeClient.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L25)

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

Defined in: [client/TimeClient.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L19)

***

### time:event:resized

```ts
time:event:resized: TimeEventInfo;
```

Defined in: [client/TimeClient.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L30)

***

### time:event:undo

```ts
time:event:undo: object;
```

Defined in: [client/TimeClient.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L20)

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

Defined in: [client/TimeClient.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L31)

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

Defined in: [client/TimeClient.ts:16](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L16)

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

Defined in: [client/TimeClient.ts:13](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L13)

#### events

```ts
events: TimeEventInfo[];
```
