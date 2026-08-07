---
id: DependencyCreationApi
title: DependencyCreationApi
---

# Interface: DependencyCreationApi

Defined in: [calendar/features/dependency.ts:55](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L55)

## Properties

### createDependency()

```ts
createDependency: (sourceId, targetId, type?) => object;
```

Defined in: [calendar/features/dependency.ts:56](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L56)

#### Parameters

##### sourceId

`string`

##### targetId

`string`

##### type?

[`DependencyType`](../type-aliases/DependencyType.md)

#### Returns

`object`

##### blocked

```ts
blocked: boolean;
```

##### error?

```ts
optional error: ResizeError;
```
