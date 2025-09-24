import { expectType } from "tsd";
import { Simplify } from "type-fest";
import type { NarrowKeys } from "../types/object-keys.js";

// Basic narrowing tests
type BasicObject = { a: string | number; b: boolean };

declare const narrowedBasic1: NarrowKeys<BasicObject, "a", string>;
declare const narrowedBasic2: NarrowKeys<BasicObject, "a", number>;
declare const narrowedBasic3: NarrowKeys<BasicObject, "b", boolean>;
declare const narrowedToNever: NarrowKeys<BasicObject, "a", boolean>;

expectType<{ a: string; b: boolean }>(narrowedBasic1);
expectType<{ a: number; b: boolean }>(narrowedBasic2);
expectType<{ a: string | number; b: boolean }>(narrowedBasic3);
expectType<{ a: never; b: boolean }>(narrowedToNever);

// Multiple key narrowing
declare const narrowedMultiKey: NarrowKeys<BasicObject, "a" | "b", string>;
expectType<{ a: string; b: never }>(narrowedMultiKey);

// Union of object types with different keys (examples from the documentation)
type UnionObjects =
  | { a: string | Date; b: string }
  | { a: string | number; c: number };

declare const narrowedUnion1: NarrowKeys<UnionObjects, "a", string>;
declare const narrowedUnion2: NarrowKeys<UnionObjects, "a", Date>;
declare const narrowedUnion3: NarrowKeys<UnionObjects, "a" | "c", string>;
declare const narrowedUnion4: NarrowKeys<
  UnionObjects,
  "a" | "c",
  string | Date
>;

expectType<{ a: string; b: string } | { a: string; c: number }>(narrowedUnion1);
expectType<{ a: Date; b: string } | { a: never; c: number }>(narrowedUnion2);
expectType<{ a: string; b: string } | { a: string; c: never }>(narrowedUnion3);
expectType<{ a: string | Date; b: string } | { a: string; c: never }>(
  narrowedUnion4,
);

type X = Simplify<typeof narrowedUnion3>;

// More complex union with shared and unique keys
type ComplexUnion =
  | { a: string | number; b: boolean; shared: string }
  | { a: number | Date; c: string; shared: string }
  | { d: number; shared: string };

declare const narrowedComplex1: NarrowKeys<ComplexUnion, "a", number>;
declare const narrowedComplex2: NarrowKeys<ComplexUnion, "shared", string>;
declare const narrowedComplex3: NarrowKeys<
  ComplexUnion,
  "a" | "c" | "d",
  string
>;

expectType<
  | { a: number; b: boolean; shared: string }
  | { a: number; c: string; shared: string }
  | { d: number; shared: string }
>(narrowedComplex1);

expectType<
  | { a: string | number; b: boolean; shared: string }
  | { a: number | Date; c: string; shared: string }
  | { d: number; shared: string }
>(narrowedComplex2);

expectType<
  | { a: string; b: boolean; shared: string }
  | { a: never; c: string; shared: string }
  | { d: never; shared: string }
>(narrowedComplex3);

// Edge cases
type EmptyObject = {};
type ObjectWithOptional = { a?: string; b: number };

declare const narrowedEmpty: NarrowKeys<EmptyObject, never, string>;

// This is arguably correct under exactOptionalPropertyTypes, which is why it
// works this way.
declare const narrowedOptional1: NarrowKeys<ObjectWithOptional, "a", string>;
expectType<EmptyObject>(narrowedEmpty);
expectType<{ a?: string; b: number }>(narrowedOptional1);

// Object with readonly properties
type ReadonlyObject = { readonly a: string | number; readonly b: boolean };
declare const narrowedReadonly: NarrowKeys<ReadonlyObject, "a", string>;
expectType<{ readonly a: string; readonly b: boolean }>(narrowedReadonly);

// Narrowing with object types. This is critical!
type WithObjectProps = { a: { x: number } | { y: string }; b: boolean };
declare const narrowedObject: NarrowKeys<WithObjectProps, "a", { x: number }>;
expectType<{ a: { x: number }; b: boolean }>(narrowedObject);

// Narrowing with array types. This is critical!
type WithArrays = { arr: number[] | string[]; other: boolean };
declare const narrowedArray: NarrowKeys<WithArrays, "arr", number[]>;
expectType<{ arr: number[]; other: boolean }>(narrowedArray);
