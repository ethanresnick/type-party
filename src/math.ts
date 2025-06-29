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

export type Permutations<T extends readonly unknown[]> = 
  PermuteRest<AllShifts<T>>;

type PermuteRest<T extends readonly unknown[]> = T extends [
  infer F,
  ...infer R
]
  ? [F, ...PermuteRest<AllShifts<R>>]
  : [];

type AllShifts<
  T extends readonly unknown[],
  N extends Nat = TupleLengthNat<T>
> = N extends Zero ? T : Shift<T, N> | AllShifts<T, Dec<N>>;

type Shift<T extends readonly unknown[], N extends Nat> = T extends readonly [
  infer F,
  ...infer R
]
  ? N extends Zero
    ? T
    : Shift<[...R, F], Dec<N>>
  : [];

// Specialized implementation of Number2Nat for tuples. 
// This version lets Permutations typecheck.
type TupleLengthNat<T extends readonly unknown[]> = T extends [
  infer _F,
  ...infer R,
]
  ? Succ<TupleLengthNat<R>>
  : Zero

type Zero = [];
type Nat = [...1[]];
type Succ<N extends Nat> = [...N, 1];
type Dec<N extends Nat> = N extends [1, ...infer T] ? T : never;
type Nat2Number<N extends Nat> = N["length"];
type Number2Nat<
  I extends number,
  N extends Nat = Zero
> = I extends Nat2Number<N> ? N : Number2Nat<I, Succ<N>>;

type NumericToNat<I extends string> = I extends `${infer T extends number}`
  ? Number2Nat<T>
  : never;

type Min2<N extends Nat, M extends Nat> = ((...args: N) => any) extends (
  ...args: M
) => any
  ? N
  : M;

type Min<T extends Nat[]> = T extends [
  infer M,
  infer N,
  ...infer R extends Nat[]
]
  ? //@ts-ignore
    Min2<M, Min<[N, ...R]>>
  : T extends [infer M extends Nat, infer N extends Nat]
  ? Min2<M, N>
  : T extends [infer M]
  ? M
  : Zero;

type Max2<N extends Nat, M extends Nat> = ((...args: N) => any) extends (
  ...args: M
) => any
  ? M
  : N;

type MaxOfUnion<It extends number> = Nat2Number<
  Parameters<
    UnionToIntersection<{ [K in It]: (...it: readonly [...Number2Nat<K>]) => any }[It]>
  >
>;

type MinOfUnion<It extends number> = Exclude<It, MaxOfUnion<It>> extends never
  ? It
  : MinOfUnion<Exclude<It, MaxOfUnion<It>>>;

type Add<N extends Nat, M extends Nat> = readonly [...N, ...M];

type Multiply<N extends Nat, M extends Nat> = M extends Zero
  ? Zero
  : Add<N, Multiply<N, Dec<M>>>;
  
type Subtract<N extends Nat, M extends Nat> = M extends Zero
  ? N
  : Subtract<Dec<N>, Dec<M>>;
