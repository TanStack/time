---
id: OverlapInfo
title: OverlapInfo
---

# Interface: OverlapInfo

Defined in: [projection/layout.ts:12](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L12)

## Properties

### cluster

```ts
cluster: number;
```

Defined in: [projection/layout.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L26)

Index of the connected overlap group this event belongs to.

***

### clusterConcurrency

```ts
clusterConcurrency: number;
```

Defined in: [projection/layout.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L32)

Highest `concurrency` in that group.

***

### clusterDepth

```ts
clusterDepth: number;
```

Defined in: [projection/layout.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L30)

Highest `depth` in that group.

***

### clusterSize

```ts
clusterSize: number;
```

Defined in: [projection/layout.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L28)

Number of events in that group.

***

### column

```ts
column: number;
```

Defined in: [projection/layout.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L34)

Slot this event was packed into by greedy interval coloring.

***

### columnCount

```ts
columnCount: number;
```

Defined in: [projection/layout.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L36)

Slots the group needs — the minimum number of side-by-side tracks.

***

### columnSpan

```ts
columnSpan: number;
```

Defined in: [projection/layout.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L38)

Free slots directly after `column`, counting itself.

***

### concurrency

```ts
concurrency: number;
```

Defined in: [projection/layout.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L22)

How many events share this event's time, counting itself.

***

### depth

```ts
depth: number;
```

Defined in: [projection/layout.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L24)

How many overlapping events start before this one. 0 means nothing is to its left.

***

### durationFraction

```ts
durationFraction: number;
```

Defined in: [projection/layout.ts:18](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L18)

***

### endFraction

```ts
endFraction: number;
```

Defined in: [projection/layout.ts:17](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L17)

***

### id

```ts
id: string;
```

Defined in: [projection/layout.ts:13](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L13)

***

### index

```ts
index: number;
```

Defined in: [projection/layout.ts:15](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L15)

Position in the array passed in, so results can be zipped back to inputs.

***

### overlapping

```ts
overlapping: string[];
```

Defined in: [projection/layout.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L20)

Ids of the events that overlap this one in time.

***

### startFraction

```ts
startFraction: number;
```

Defined in: [projection/layout.ts:16](https://github.com/TanStack/time/blob/main/packages/time/src/projection/layout.ts#L16)
