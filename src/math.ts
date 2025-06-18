/**
 * @fileoverview Types for doing math in TS, by representing each natural number
 * as a tuple with n elements, and exploiting its ability to track a tuple's
 * length as a number literal type.
 */

import type { UnionToIntersection } from "type-fest";

/**
 * Creates a type representing a range of numbers from Min to Max (inclusive)
 */
export type NumericRange<
  Min extends number,
  Max extends number,
  Arr extends number[] = [],
  Curr extends number = never
> = Arr["length"] extends Max
  ? Arr[number] | Max
  : NumericRange<
      Min,
      Max,
      [...Arr, Arr["length"]],
      Arr["length"] extends Min ? Arr["length"] : Curr
    >;

type Zero = readonly [];
type SomeNat = readonly [...unknown[]];
type Succ<N extends SomeNat> = readonly [...N, unknown];
type Dec<N extends SomeNat> = N extends readonly [unknown, ...infer T]
  ? T
  : never;
type Nat2Number<N extends SomeNat> = N["length"];
type Number2Nat<
  I extends number,
  N extends SomeNat = Zero
> = I extends Nat2Number<N> ? N : Number2Nat<I, Succ<N>>;

type NumericToNat<I extends string> = I extends `${infer T extends number}`
  ? Number2Nat<T>
  : never;

type Min2<N extends SomeNat, M extends SomeNat> = ((
  ...args: N
) => any) extends (...args: M) => any
  ? N
  : M;

type Min<T extends SomeNat[]> = T extends [
  infer M,
  infer N,
  ...infer R extends SomeNat[]
]
  ? //@ts-ignore
    Min2<M, Min<[N, ...R]>>
  : T extends [infer M extends SomeNat, infer N extends SomeNat]
  ? Min2<M, N>
  : T extends [infer M]
  ? M
  : Zero;

type Max2<N extends SomeNat, M extends SomeNat> = ((
  ...args: N
) => any) extends (...args: M) => any
  ? M
  : N;

type MaxOfUnion<It extends number> = Nat2Number<
  Parameters<
    UnionToIntersection<{ [K in It]: (...it: Number2Nat<K>) => any }[It]>
  >
>;

type MinOfUnion<It extends number> = Exclude<It, MaxOfUnion<It>> extends never
  ? It
  : MinOfUnion<Exclude<It, MaxOfUnion<It>>>;

type Add<N extends SomeNat, M extends SomeNat> = readonly [...N, ...M];
type Multiply<N extends SomeNat, M extends SomeNat> = M extends Zero
  ? Zero
  : Add<N, Multiply<N, Dec<M>>>;
type Subtract<N extends SomeNat, M extends SomeNat> = M extends Zero
  ? N
  : Subtract<Dec<N>, Dec<M>>;
