import { expectAssignable, expectType } from "tsd";
import type { PreserveReadonly } from "../types/arrays-and-tuples.js";

// Arrays
declare const arr1: PreserveReadonly<number[], string[]>;
expectType<string[]>(arr1);

declare const arr2: PreserveReadonly<readonly number[], string[]>;
expectType<readonly string[]>(arr2);

declare const arr3: PreserveReadonly<
  readonly (number | string)[],
  (boolean | number)[]
>;
expectType<readonly (boolean | number)[]>(arr3);

// any in V should be preserved and readonly applied based on T
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const arrAnyReadonly: PreserveReadonly<readonly number[], any[]>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<readonly any[]>(arrAnyReadonly);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const arrAnyMutable: PreserveReadonly<number[], any[]>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<any[]>(arrAnyMutable);

declare const readonlyAny1: PreserveReadonly<string[], ReadonlyArray<any>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<any[]>(readonlyAny1);

declare const readonlyAny2: PreserveReadonly<
  readonly string[],
  ReadonlyArray<any>
>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<readonly any[]>(readonlyAny2);

// Tuples
declare const tup1: PreserveReadonly<[1, 2], [string, number]>;
expectType<[string, number]>(tup1);

declare const tup2: PreserveReadonly<readonly [1, 2], [string, number]>;
expectType<readonly [string, number]>(tup2);

// Empty tuples
declare const tupEmpty1: PreserveReadonly<[], []>;
expectType<[]>(tupEmpty1);

declare const tupEmpty2: PreserveReadonly<readonly [], []>;
expectType<readonly []>(tupEmpty2);

// Mixed readonly/non-readonly union for T should be preserved
declare const tupUnionT: PreserveReadonly<readonly [1] | [1], [2]>;
expectType<readonly [2] | [2]>(tupUnionT);

declare const tupUnionT2: PreserveReadonly<readonly [1] | [4], [2]>;
expectType<readonly [2] | [2]>(tupUnionT2);

// T as any and unknown
declare const fromAny: PreserveReadonly<any, [string]>;
expectType<[string]>(fromAny);

// V as a union of array types
declare const vUnionArrMutable: PreserveReadonly<number[], string[] | number[]>;
expectType<string[] | number[]>(vUnionArrMutable);

declare const vUnionArrReadonly: PreserveReadonly<
  readonly number[],
  string[] | number[]
>;
expectType<readonly string[] | readonly number[]>(vUnionArrReadonly);

declare const allMutable: PreserveReadonly<number[], string[] | number[]>;
expectType<string[] | number[]>(allMutable);

declare const allImmutable: PreserveReadonly<
  readonly number[],
  readonly string[] | readonly number[]
>;
expectType<readonly string[] | readonly number[]>(allImmutable);

declare const mixed1: PreserveReadonly<number[], readonly string[] | number[]>;
expectType<string[] | number[]>(mixed1);

declare const mixed2: PreserveReadonly<readonly number[], string[] | number[]>;
expectType<readonly string[] | readonly number[]>(mixed2);

// V as a union of tuple types
declare const vUnionTupMutable: PreserveReadonly<[0], [1] | [2]>;
expectType<[1] | [2]>(vUnionTupMutable);

declare const vUnionTupReadonly: PreserveReadonly<readonly [0], [1] | [2]>;
expectType<readonly [1] | readonly [2]>(vUnionTupReadonly);

// V as a mixed union of tuple and array
declare const vUnionMixedMutable: PreserveReadonly<[0], [1] | number[]>;
expectType<[1] | number[]>(vUnionMixedMutable);

declare const vUnionMixedReadonly: PreserveReadonly<
  readonly [0],
  [1] | number[]
>;
expectType<readonly [1] | readonly number[]>(vUnionMixedReadonly);

// V union including any should preserve any and apply readonly per T
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const vUnionAnyMutable: PreserveReadonly<number[], any | [1]>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<any>(vUnionAnyMutable);

// This produces Readonly<any>, and we could pretty easily make it produce just
// `any`, but adding an extra conditional branch doesn't seem worth it, since
// Readonly<any> is assignable to any anyway.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const vUnionAnyReadonly: PreserveReadonly<readonly number[], any | [1]>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectAssignable<any>(vUnionAnyReadonly);
