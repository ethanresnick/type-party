import type { Simplify } from "type-fest";
import type { AllKeys } from "./object-keys.d.ts";

/**
 * CollapseCases takes a type T that's a union of object types, and returns a
 * single object type where the type of each key is the union of the types for
 * that key across all the cases of T.
 *
 * For example, if you have:
 *
 * type A = { id: 'A' }
 * type B = { id: 'B' }
 * type C = { id: 'C' }
 *
 * type Item =
 *  | { id: string; type: A; }
 *  | { id: string; type: B; }
 *  | { id: string; type: C; }
 *
 * Then, `CollapseCases<Item>` will be: `{ id: string, type: A | B | C }`.
 *
 * This can be useful because Typescript checks assignability case by case,
 * so a type like `{ id: string, type: A | B | C }` would not be assignable
 * to Item, because TS can only see that it's not known to be assignable to
 * any of Item's individual cases.
 *
 * The fix, assuming `x` has type `{ id: string, type: A | B | C }`,
 * would be something like `x satisfies CollapseCases<Item> as Item`.
 *
 * Note: in cases where a key only appears in some of the cases, the
 * result type will have that key as optional, and typed as `unknown`.
 *  E.g., `CollapseCases<{ a: string } | { b: string }>` will be
 * `{ a?: unknown, b?: unknown }`. This is the correct type because the first
 * type in the union can be satisfied with any value in its key for `b`, and
 * vice-versa. I.e., `{ a: 'hello', b: true }` and `{ a: 42, b: 'hello' }` are
 * both legal assignments to `{ a: string } | { b: string }` (ignoring
 * excess property checking heuristics that only sometimes apply), as they
 * satisfy the first and second case respectively.
 */
export type CollapseCases<T extends object> = Simplify<
  Pick<T, keyof T> & Partial<Pick<T, AllKeys<T>>>
>;

/**
 * Same as CollapseCases, but does it recursively on object types. Useful when
 * the type with the discriminated union is nested inside another object.
 *
 * For example with:
 *
 * type T =
 *   | { name: 'A', data: { value: 'C' | 'D' } }
 *   | { name: 'B', data: { value: 'E' | 'F' } }
 *
 * `CollapseCasesDeep<T>` will be:
 *
 * { name: 'A' | 'B', data: { value: 'C' | 'D' | 'E' | 'F' } }
 *
 * Whereas `CollapseCases<T>` would only be:
 *
 * { name: 'A' | 'B', data: { value: 'C' | 'D' } | { value: 'E' | 'F' } }
 */
export type CollapseCasesDeep<T extends object> = Simplify<
  {
    // For all the keys in T that are in _any_ case (if T is a union) but not
    // in _every_ case (which is what `keyof T` returns), make them optional.
    [K in Exclude<AllKeys<T>, keyof T>]?: T[K] extends object
      ? CollapseCasesDeep<T[K]>
      : T[K];
  } & {
    // Meanwhile, the keys from every case are required in the final object
    // type. `AllKeys<T> & keyof T` here might seem redundant, and it is, in the
    // sense that it's always equal to just `keyof T`. However, it's necessary
    // to prevent a TS rule from kicking in whereby, if T is a union, TS will
    // silently distribute in the { [K in keyof T]: ... } type, which we don't
    // want.
    [K in AllKeys<T> & keyof T]: T[K] extends object
      ? CollapseCasesDeep<T[K]>
      : T[K];
  }
>;
