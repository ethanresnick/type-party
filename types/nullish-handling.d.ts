import type { Simplify } from "type-fest";

/**
 * This is useful for turning `JSONWithUndefined` into `JSON` (without using the
 * type-fest `Jsonify` type, which supports a wider range of types, but can lead
 * to some gnarly type errors in various corner cases).
 */
export type RemoveUndefinedDeep<T> =
  // If T is exactly undefined, remove it
  [T] extends [undefined]
    ? never
    : // If T is a union, distribute over the union
      T extends unknown
      ? // If T includes undefined, remove it from the union
        undefined extends T
        ? RemoveUndefinedDeep<Exclude<T, undefined>>
        : T extends (infer U)[]
          ? RemoveUndefinedDeep<U>[]
          : T extends object
            ? Simplify<
                RemoveUndefinedOrNeverObjectKeys<{
                  [K in keyof T]: RemoveUndefinedDeep<T[K]>;
                }>
              >
            : T
      : never;

type RemoveUndefinedOrNeverObjectKeys<T> = {
  [K in keyof T as [undefined] extends [T[K]]
    ? never
    : T[K] extends never
      ? never
      : K]: T[K];
};
