---
id: TimeEventRecord
title: TimeEventRecord
---

# Interface: TimeEventRecord

Defined in: [client/TimeClient.ts:57](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L57)

## Properties

### payload

```ts
payload: 
  | TimeEventInfo
  | {
  events: TimeEventInfo[];
}
  | TimeEventInfo & object
  | {
  added: TimeEventInfo[];
  removed: TimeEventInfo[];
  updated: TimeEventInfo[];
}
  | {
  added: TimeEventInfo[];
  removed: TimeEventInfo[];
  updated: TimeEventInfo[];
}
  | {
  attemptedEnd?: string;
  attemptedStart?: string;
  conflicts?: AvailabilityConflict[];
  eventId: string;
  eventTitle: string;
  message: string;
  originalEnd: string;
  originalStart: string;
  reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
}
  | {
  direction: "previous" | "next" | "current" | "specific";
  targetDate: string;
}
  | {
  viewMode: {
     unit: string;
     value: number;
  };
};
```

Defined in: [client/TimeClient.ts:59](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L59)

***

### timestamp

```ts
timestamp: number;
```

Defined in: [client/TimeClient.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L60)

***

### type

```ts
type: keyof TimeEventMap;
```

Defined in: [client/TimeClient.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/client/TimeClient.ts#L58)
