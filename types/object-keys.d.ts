import { Simplify } from "type-fest";

/**
 * Returns all the keys from a union of object types.
 *
 * I.e., with a `type T = { a: number, b: string } | { a: boolean }`,
 *
 * I.e., `keyof T` will normally only return `'a'`, because `keyof` with an
 * object type union returns the keys that exist in _every_ constituent of the
 * union. However, AllKeys<T> will return `'a' | 'b'`.
 */
export type AllKeys<T extends object> = T extends object ? keyof T : never;

export type StringKeys<T extends object> = keyof T & string;

export type NullableKeys<T extends object> = {
  [K in keyof T]-?: null extends T[K] ? K : never;
}[keyof T];

/**
 * Given an object type T (or union of object types), a key type K (which may be
 * a union of keys), and a value type V, return a new object type (union) where
 * the, for every constituent X of T and for every key P in K, X[P] is narrowed to V
 * if X[P] either extends or is extended by V, and is never otherwise.
 *
 * For example, if you have:
 *
 * type T = { a: string | Date, b: string } | { a: string | number, c: number }
 * type K = 'a' | 'c'
 * type V = Date | string
 *
 * then NarrowKey<T, K, V> will be:
 *
 * { a: string | Date, b: string } | { a: string, c: never; }
 */
export type NarrowKeys<T extends object, K extends AllKeys<T>, V> =
  // If T is a union type, distribute over the union
  T extends object
    ? // Written this way, instead of `[P in (keyof T & K)]`, as a workaround
      // for https://github.com/microsoft/TypeScript/issues/60233#issuecomment-3325973592.
      // This also preserves `readonly` etc.
      Simplify<
        Pick<{ [P in keyof T]: _Helper<T[P], V> }, K & keyof T> & Omit<T, K>
      >
    : never;

type _Helper<T, V> = T extends unknown
  ? V extends unknown
    ? V extends T
      ? V
      : T extends V
        ? T
        : never
    : never
  : never;
