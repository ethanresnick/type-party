import type { Primitive } from "type-fest";

/**
 * Apply this to a type that's NOT a conditional type (like a mapped type or an
 * indexed access type) to prevent the computations required to resolve that
 * type from contributing to Typescript's internal type instantiation depth
 * counter, thereby preventing many "Type instantiation is excessively deep and
 * possibly infinite" errors.
 *
 * See Kysely type of the same name for more details.
 */
export type DrainOuterGeneric<T> = [T] extends [unknown] ? T : never;

export type Simplify<T> = DrainOuterGeneric<{ [K in keyof T]: T[K] } & {}>;

/**
 * A TypeScript utility type that limits the nesting depth of any type.
 *
 * Use as `DepthCapped<T, DepthLimit?, AtDepthLimitType?>`.
 *
 * When the nesting depth exceeds the specified limit, further nested structures
 * are replaced with the specified replacement type (defaults to `any`). This is
 * useful for working with deeply nested or recursive types that might otherwise
 * cause TypeScript compiler performance issues or hit recursion limits.
 *
 * @example
 * ```ts
 * // Recursive list type with depth 3
 * type List<T> = [T, List<T> | null];
 * type CappedList = DepthCapped<List<string>>;
 * // Result: [string, [string, [string, any] | null] | null]
 *
 * // With depth 2
 * type CappedListDepth2 = DepthCapped<List<string>, 2>;
 * // Result: [string, [string, any] | null]
 *
 * // Custom replacement type
 * type CappedListCustom = DepthCapped<List<string>, 3, "TOO_DEEP">;
 * // Result: [string, [string, [string, "TOO_DEEP"] | null] | null]
 *
 * // Deep object with depth 2
 * type DeepObj = { a: { b: { c: { d: string } } } };
 * type CappedObj = DepthCapped<DeepObj, 2>;
 * // Result: { a: { b: any } }
 * ```
 *
 * @param T - The type to apply depth capping to
 * @param DepthLimit - The maximum nesting depth (literal number, defaults to 3)
 * @param AtDepthLimitType - The type to use when depth limit is reached (defaults to any)
 * @param DepthCounter - Internal depth counter (tuple whose length represents remaining depth)
 */
export type DepthCapped<
  T,
  DepthLimit extends number = 8,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AtDepthLimitType = any,
  DepthCounter extends readonly unknown[] = NumberToTuple<DepthLimit>,
> = DepthCounter["length"] extends 0
  ? T extends Primitive
    ? T
    : // Hit depth limit, return replacement type for any further nesting,
      // unless we're at a primitive, which can't recurse.
      AtDepthLimitType
  : T extends [infer First, infer Second]
    ? [
        DepthCapped<
          First,
          DepthLimit,
          AtDepthLimitType,
          DecrementDepth<DepthCounter>
        >,
        DepthCapped<
          Second,
          DepthLimit,
          AtDepthLimitType,
          DecrementDepth<DepthCounter>
        >,
      ] // 2-element tuple: process each element with decremented depth
    : T extends [infer First, infer Second, infer Third]
      ? [
          DepthCapped<
            First,
            DepthLimit,
            AtDepthLimitType,
            DecrementDepth<DepthCounter>
          >,
          DepthCapped<
            Second,
            DepthLimit,
            AtDepthLimitType,
            DecrementDepth<DepthCounter>
          >,
          DepthCapped<
            Third,
            DepthLimit,
            AtDepthLimitType,
            DecrementDepth<DepthCounter>
          >,
        ] // 3-element tuple
      : T extends [infer First, infer Second, infer Third, infer Fourth]
        ? [
            DepthCapped<
              First,
              DepthLimit,
              AtDepthLimitType,
              DecrementDepth<DepthCounter>
            >,
            DepthCapped<
              Second,
              DepthLimit,
              AtDepthLimitType,
              DecrementDepth<DepthCounter>
            >,
            DepthCapped<
              Third,
              DepthLimit,
              AtDepthLimitType,
              DecrementDepth<DepthCounter>
            >,
            DepthCapped<
              Fourth,
              DepthLimit,
              AtDepthLimitType,
              DecrementDepth<DepthCounter>
            >,
          ] // 4-element tuple (covers most common cases)
        : T extends (infer Element)[]
          ? DepthCapped<
              Element,
              DepthLimit,
              AtDepthLimitType,
              DecrementDepth<DepthCounter>
            >[] // Array: element type goes deeper
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            T extends Record<string, any>
            ? {
                [K in keyof T]: DepthCapped<
                  T[K],
                  DepthLimit,
                  AtDepthLimitType,
                  DecrementDepth<DepthCounter>
                >;
              } // Object: each property goes deeper
            : T; // Primitives, functions, etc.: return as-is

// Helper type to convert a number literal to a tuple of that length
type NumberToTuple<
  N extends number,
  Result extends readonly unknown[] = [],
> = Result["length"] extends N
  ? Result
  : NumberToTuple<N, [...Result, unknown]>;

// Helper type to decrement depth counter (represented as tuple length)
type DecrementDepth<D extends readonly unknown[]> = D extends readonly [
  unknown,
  ...infer Rest,
]
  ? Rest
  : [];
