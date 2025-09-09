import type { IsAny } from "type-fest";
import type { PreserveReadonly } from "./arrays-and-tuples.d.ts";

/**
 * This is useful for turning `JSONWithUndefined` into `JSON` (without using the
 * type-fest `Jsonify` type, which supports a wider range of types, but can lead
 * to some gnarly type errors in various corner cases). Note that it doesn't
 * exactly match the behavior of JSON.stringify, as it turns ["hi",undefined]
 * into ["hi", never] -- i.e. it does deeply remove undefined -- whereas
 * JSON.stringify turns it into ["hi", null].
 */
export type RemoveUndefinedDeep<T> =
  // If T is exactly undefined (or never, as [never] extends [undefined]), remove it
  [T] extends [undefined]
    ? // unless it's `any`
      IsAny<T> extends true
      ? T
      : never
    : // If T is a union, distribute over the union
      T extends unknown
      ? // If T includes undefined, remove it from the union
        undefined extends T
        ? RemoveUndefinedDeep<Exclude<T, undefined>>
        : T extends readonly [] | readonly [...never[]]
          ? PreserveReadonly<T, []>
          : T extends readonly [infer U, ...infer V]
            ? PreserveReadonly<
                T,
                // @ts-expect-error 2589: This won't be infinite when
                // RemoveUndefinedDeep is actually instantiated.
                [RemoveUndefinedDeep<U>, ...RemoveUndefinedDeep<V>]
              >
            : T extends readonly [...infer U, infer V]
              ? PreserveReadonly<
                  T,
                  [...RemoveUndefinedDeep<U>, RemoveUndefinedDeep<V>]
                >
              : T extends ReadonlyArray<infer ItemType>
                ? PreserveReadonly<T, RemoveUndefinedDeep<ItemType>[]>
                : T extends object
                  ? RemoveUndefinedOrNeverObjectKeys<{
                      [K in keyof T]: RemoveUndefinedDeep<T[K]>;
                    }>
                  : T
      : never;

type RemoveUndefinedOrNeverObjectKeys<T> = {
  // Need the extra branch here to keep `any`.
  [K in keyof T as [T[K]] extends [undefined]
    ? IsAny<T[K]> extends true
      ? K
      : never
    : K]: T[K];
};
