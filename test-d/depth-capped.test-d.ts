import { expectType } from "tsd";
import type { DepthCapped } from "../types/simplify.js";

// Recursive types...
type List<T> = [T, List<T> | null];

// Test mix of objects and arrays, readonly and not.
type Tree<T> = {
  value: T;
  readonly children: Tree<T>[];
  favoriteChild: Tree<T> | null;
  meta: readonly string[];
};

declare const list3Deep: DepthCapped<List<string>, 3, unknown>;
declare const list2Deep: DepthCapped<List<string>, 2, any>;
declare const list1Deep: DepthCapped<List<string>, 1, unknown>;

expectType<[string, [string, [string, unknown] | null] | null]>(list3Deep);
expectType<[string, [string, any] | null]>(list2Deep);
expectType<[string, unknown]>(list1Deep);

declare const tree4Deep: DepthCapped<Tree<string>, 4, "AT_LIMIT">;

type Tree4Deep = {
  value: string;
  readonly children: Array<{
    value: string;
    readonly children: "AT_LIMIT"[];
    favoriteChild: {
      value: string;
      readonly children: "AT_LIMIT";
      favoriteChild: "AT_LIMIT" | null;
      meta: "AT_LIMIT";
    } | null;
    meta: readonly string[];
  }>;
  favoriteChild: {
    value: string;
    readonly children: Array<{
      value: string;
      readonly children: "AT_LIMIT";
      favoriteChild: "AT_LIMIT" | null;
      meta: "AT_LIMIT";
    }>;
    favoriteChild: {
      value: string;
      readonly children: "AT_LIMIT"[];
      favoriteChild: {
        value: string;
        readonly children: "AT_LIMIT";
        favoriteChild: "AT_LIMIT" | null;
        meta: "AT_LIMIT";
      } | null;
      meta: readonly string[];
    } | null;
    meta: readonly string[];
  } | null;
  meta: readonly string[];
};

expectType<Tree4Deep>(tree4Deep);

// Not recursive, just deep.
type DeepObject = { a: { b: { readonly c: { d: string }; x: true } } };
declare const deepObject1: DepthCapped<DeepObject, 3>;
expectType<{ a: { b: { readonly c: any; x: true } } }>(deepObject1); // eslint-disable-line @typescript-eslint/no-explicit-any

declare const deepObject2: DepthCapped<DeepObject, 2, "DEPTH_LIMIT_REACHED">;
expectType<{ a: { b: "DEPTH_LIMIT_REACHED" } }>(deepObject2);

// Deep Arrays with various depths
type DeepArray = string[][][];
declare const deepArray1: DepthCapped<DeepArray, 4>;
expectType<string[][][]>(deepArray1); // preserves all 3 levels

declare const deepArray2: DepthCapped<DeepArray, 2>;
expectType<any[][]>(deepArray2);
