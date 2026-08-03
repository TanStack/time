---
id: SaveEventResult
title: SaveEventResult
---

# Type Alias: SaveEventResult

```ts
type SaveEventResult = 
  | {
  success: true;
}
  | {
  error: ResizeError;
  success: false;
};
```

Defined in: [calendar/types.ts:238](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L238)

Result of a CalendarActions.saveEvent call.
