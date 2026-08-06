const PASSTHROUGH_KEYS = new Set([
  "then",
  "toJSON",
  "toString",
  "valueOf",
  "constructor",
  "prototype",
  "$$typeof",
  "inspect",
  "nodeType",
]);

export function guardApi<TApi extends object>(
  api: TApi,
  describeMissing: (key: string) => string,
): TApi {
  return new Proxy(api, {
    get(target, key, receiver) {
      if (
        typeof key === "string" &&
        !PASSTHROUGH_KEYS.has(key) &&
        !Reflect.has(target, key)
      ) {
        throw new Error(describeMissing(key));
      }
      return Reflect.get(target, key, receiver);
    },
  });
}
