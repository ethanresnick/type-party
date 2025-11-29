import type { Primitive, Simplify, Tagged, UnwrapTagged } from "type-fest";
import type { DrainOuterGeneric } from "./simplify.d.ts";

/**
 * This type is exactly like Pick, except that it takes a union type as its
 * first argument, and returns a union of the picked types. Concretely:
 *
 * ```
 * Pick<
 *   { id: string, x: string, y: any } | { id: number, x: number, y: any },
 *   'id' | 'x'
 * >
 * ```
 *
 * returns
 *
 * ```
 * { id: string | number, x: string | number }
 * ```
 *
 * Whereas `PickEach` preserves the original structure, giving
 *
 * { id: string, x: string } | { id: number, x: number }
 *
 * The difference is that the second type, correctly, rejects an object like
 * `{ id: 'string', x: 4 }`.
 *
 * This works by exploiting that fact that conditional types distribute over
 * unions in TS.
 */
export type PickEach<Union, Keys extends keyof Union> = Union extends unknown
  ? Pick<Union, Keys>
  : never;

/**
 * This type allows you to replace a type within a complex type. It works
 * recursively, so it can handle nested types as well.
 *
 * @template Type The original type.
 * @template Search The type to be replaced. Any time it -- or a subtype of it
 *   -- is found (deeply) within @see {Type}, it will be replaced.
 * @template Replacement The type to replace with.
 *
 * @example
 *  ReplaceDeep<{ a: "x" | "y", b: { c: number } }, string, number> will return
 *  { a: number, b: { c: number } }. The type of `a` is replaced b/c "x" | "y"
 *  is a subtype of `string`, even though it's not exactly `string`.
 *
 * @example
 *   ReplaceDeep<{ a: string, b: { c: number } }, "x", number> will return
 *   the first type parameter without doing any replacements. The type of `a` is
 *   _not_ replaced, b/c string is not assignable to (i.e., isn't necesssarily)
 *   the "x" that's being searched for.
 */
export type ReplaceDeep<
  Type,
  Search,
  Replacement,
  IncludeFunctions extends boolean = false,
> = DrainOuterGeneric<
  Type extends Search
    ? Replacement
    : Type extends Tagged<unknown, infer Tag>
      ? Tagged<ReplaceDeep<UnwrapTagged<Type>, Search, Replacement>, Tag>
      : Type extends Primitive | Date | RegExp
        ? Type
        : // Treat Promises and AsyncIterables specially because, while it's possible
          // to do replacement totally structurally, that's likely undesirable and might
          // push up against TS limits deep in the replacement
          Type extends Promise<infer T>
          ? Promise<ReplaceDeep<T, Search, Replacement, IncludeFunctions>>
          : Type extends AsyncIterable<infer T>
            ? Simplify<
                AsyncIterable<
                  ReplaceDeep<T, Search, Replacement, IncludeFunctions>
                > &
                  Omit<Type, typeof Symbol.asyncIterator>
              >
            : IncludeFunctions extends true
              ? Type extends (...args: infer Args) => infer R
                ? (
                    ...args: ReplaceDeep<
                      Args,
                      Search,
                      Replacement,
                      IncludeFunctions
                    > &
                      unknown[]
                  ) => ReplaceDeep<R, Search, Replacement, IncludeFunctions>
                : ReplaceObjectDeep<Type, Search, Replacement, IncludeFunctions>
              : ReplaceObjectDeep<Type, Search, Replacement, IncludeFunctions>
>;

type ReplaceObjectDeep<
  Type,
  Search,
  Replacement,
  IncludeFunctions extends boolean = false,
> = Type extends object
  ? {
      [Key in keyof Type]: ReplaceDeep<
        Type[Key],
        Search,
        Replacement,
        IncludeFunctions
      >;
    }
  : never;
