import { expectType } from "tsd";
import type { RemoveUndefinedDeep } from "../types/nullish-handling.js";

// Scalars
declare const neverRemoved: RemoveUndefinedDeep<undefined>;
expectType<never>(neverRemoved);

declare const neverFromNever: RemoveUndefinedDeep<never>;
expectType<never>(neverFromNever);

declare const anyPreservedAtRoot: RemoveUndefinedDeep<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<any>(anyPreservedAtRoot);

// Unions at root
declare const union1: RemoveUndefinedDeep<string | undefined>;
expectType<string>(union1);

declare const union2: RemoveUndefinedDeep<string | number | undefined>;
expectType<string | number>(union2);

declare const unionAny: RemoveUndefinedDeep<any | undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<any>(unionAny);

declare const nullPreserved: RemoveUndefinedDeep<string | null | undefined>;
expectType<string | null>(nullPreserved);

declare const arrayUnion: RemoveUndefinedDeep<readonly string[] | undefined>;
expectType<readonly string[]>(arrayUnion);

// Arrays
declare const arr1: RemoveUndefinedDeep<(string | undefined)[]>;
expectType<string[]>(arr1);

declare const arr2: RemoveUndefinedDeep<readonly (string | undefined)[]>;
expectType<readonly string[]>(arr2);

declare const arrNested: RemoveUndefinedDeep<(string | undefined)[][]>;
expectType<string[][]>(arrNested);

declare const anyArray: RemoveUndefinedDeep<any[]>;
declare const anyArrayReadonly: RemoveUndefinedDeep<readonly any[]>;
expectType<any[]>(anyArray);
expectType<readonly any[]>(anyArrayReadonly);

// Tuples
declare const tupleEmpty: RemoveUndefinedDeep<readonly []>;
expectType<readonly []>(tupleEmpty);

declare const tuple1: RemoveUndefinedDeep<[string, undefined]>;
expectType<[string, never]>(tuple1);

declare const tuple2: RemoveUndefinedDeep<readonly [string | undefined]>;
expectType<readonly [string]>(tuple2);

declare const tuple3: RemoveUndefinedDeep<
  readonly [string | undefined, undefined]
>;
expectType<readonly [string, never]>(tuple3);

declare const tuple4: RemoveUndefinedDeep<[1, 2 | undefined]>;
expectType<[1, 2]>(tuple4);

declare const tuple5: RemoveUndefinedDeep<
  readonly [string | undefined, number | undefined]
>;
expectType<readonly [string, number]>(tuple5);

declare const tupleUnionAtRoot: RemoveUndefinedDeep<readonly [1] | undefined>;
expectType<readonly [1]>(tupleUnionAtRoot);

// Objects
declare const obj1: RemoveUndefinedDeep<{
  a: string | undefined;
  b: undefined;
}>;
expectType<{ a: string }>(obj1);

declare const obj2: RemoveUndefinedDeep<{
  a: { b: undefined; c: string | undefined };
}>;
expectType<{ a: { c: string } }>(obj2);

declare const obj3: RemoveUndefinedDeep<{ readonly a: string | undefined }>;
expectType<{ readonly a: string }>(obj3);

declare const obj4: RemoveUndefinedDeep<{ a: any | undefined; b: undefined }>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<{ a: any }>(obj4);

declare const objWithReadonlyAny: RemoveUndefinedDeep<{ readonly x: any }>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<{ readonly x: any }>(objWithReadonlyAny);

declare const objWithString: RemoveUndefinedDeep<{ x: string }>;
expectType<{ x: string }>(objWithString);

declare const obj5: RemoveUndefinedDeep<{ a: never; b: undefined }>;
expectType<{}>(obj5);
