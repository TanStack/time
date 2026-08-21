---
id: DependencyCreationApi
title: DependencyCreationApi
---

# Interface: DependencyCreationApi

Defined in: [calendar/features/dependency.ts:65](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L65)

## Properties

### createDependency()

```ts
createDependency: (sourceId, targetId, type?, lag?) => object;
```

Defined in: [calendar/features/dependency.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L66)

#### Parameters

##### sourceId

`string`

##### targetId

`string`

##### type?

[`DependencyType`](../type-aliases/DependencyType.md)

##### lag?

`number`

#### Returns

`object`

##### blocked

```ts
blocked: boolean;
```

##### error?

```ts
optional error: EventMutationError;
```
