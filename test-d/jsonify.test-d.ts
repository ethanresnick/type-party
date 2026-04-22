/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { expectAssignable, expectNotAssignable, expectType } from "tsd";
import type { EmptyObject, JsonObject, JsonValue } from "type-fest";
import type { JSON, Jsonify } from "../types/json.js";

interface A {
  a: number;
}

class B {
  a!: number;
}

interface V {
  a?: number;
}

interface X {
  a: Date;
}

interface Y {
  a?: Date;
}

interface Z {
  a: number | undefined;
}

interface W {
  a?: () => any;
}

declare const a: Jsonify<A>;
declare const b: Jsonify<B>;

declare const v: V; // Not assignable to JsonValue because it is defined as interface

declare const x: X; // Not assignable to JsonValue because it contains Date value
declare const y: Y; // Not assignable to JsonValue because it contains Date value

declare const z: Z; // Not assignable to JsonValue because undefined is not valid Json value
declare const w: W; // Not assignable to JsonValue because a function is not valid Json value

expectAssignable<JsonValue>(null);
expectAssignable<JsonValue>(false);
expectAssignable<JsonValue>(0);
expectAssignable<JsonValue>("");
expectAssignable<JsonValue>([]);
expectAssignable<JsonValue>([] as const);
expectAssignable<JsonValue>({});
expectAssignable<JsonValue>([0]);
expectAssignable<JsonValue>({ a: 0 });
expectAssignable<JsonValue>(a);
expectAssignable<JsonValue>(b);
expectAssignable<JsonValue>({ a: { b: true, c: {} }, d: [{}, 2, "hi"] });
expectAssignable<JsonValue>([{}, { a: "hi" }, null, 3]);

expectNotAssignable<JsonValue>(new Date());
expectNotAssignable<JsonValue>([new Date()]);
expectNotAssignable<JsonValue>({ a: new Date() });
expectNotAssignable<JsonValue>(v);
expectNotAssignable<JsonValue>(x);
expectNotAssignable<JsonValue>(y);
expectNotAssignable<JsonValue>(z);
expectNotAssignable<JsonValue>(w);
expectNotAssignable<JsonValue>(undefined);
expectNotAssignable<JsonValue>(5 as number | undefined);

// TODO: Convert this to a `type`.
interface Geometry {
  type: "Point" | "Polygon";
  coordinates: [number, number];
}

const point: Geometry = {
  type: "Point",
  coordinates: [1, 1],
};

expectNotAssignable<JsonValue>(point);
expectAssignable<Jsonify<Geometry>>(point);

// The following const values are examples of values `v` that are not JSON, but are *jsonable* using
// `v.toJSON()` or `JSON.parse(JSON.stringify(v))`
declare const dateToJSON: Jsonify<Date>;
expectAssignable<JsonValue>(dateToJSON);
expectAssignable<string>(dateToJSON);

// The following commented `= JSON.parse(JSON.stringify(x))` is an example of how `parsedStringifiedX` could be created.
// * Note that this would be an unsafe assignment because `JSON.parse()` returns type `any`.
// But by inspection `JSON.stringify(x)` will use `x.a.toJSON()`. So the `JSON.parse()` result can be
// assigned to `Jsonify<X>` if the `@typescript-eslint/no-unsafe-assignment` ESLint rule is ignored
// or an `as Jsonify<X>` is added.
// * This test is not about how `parsedStringifiedX` is created, but about its type, so the `const` value is declared.
declare const parsedStringifiedX: Jsonify<X>; // = JSON.parse(JSON.stringify(x));
expectAssignable<JsonValue>(parsedStringifiedX);
expectAssignable<string>(parsedStringifiedX.a);

class NonJsonWithToJSON {
  public fixture = new Map<string, number>([
    ["a", 1],
    ["b", 2],
  ]);

  public toJSON(): { fixture: Array<[string, number]> } {
    return {
      fixture: [...this.fixture.entries()],
    };
  }
}

const nonJsonWithToJSON = new NonJsonWithToJSON();
expectNotAssignable<JsonValue>(nonJsonWithToJSON);
expectAssignable<JsonValue>(nonJsonWithToJSON.toJSON());
expectAssignable<Jsonify<NonJsonWithToJSON>>(nonJsonWithToJSON.toJSON());

class NonJsonExtendPrimitiveWithToJSON extends Number {
  public fixture = 42n;

  public toJSON(): { fixture: string } {
    return {
      fixture: "42n",
    };
  }
}

const nonJsonExtendPrimitiveWithToJSON = new NonJsonExtendPrimitiveWithToJSON();
expectNotAssignable<JsonValue>(nonJsonExtendPrimitiveWithToJSON);
expectAssignable<JsonValue>(nonJsonExtendPrimitiveWithToJSON.toJSON());
expectAssignable<Jsonify<NonJsonExtendPrimitiveWithToJSON>>(
  nonJsonExtendPrimitiveWithToJSON.toJSON(),
);

class NonJsonWithToJSONWrapper {
  public inner: NonJsonWithToJSON = nonJsonWithToJSON;
  public override = 42;

  public toJSON() {
    const stringOverride = "override";

    return {
      override: stringOverride,
      inner: this.inner,
      innerDeep: { inner: this.inner },
    };
  }
}

expectNotAssignable<JsonValue>(new NonJsonWithToJSONWrapper());

type InnerFixture = { fixture: Array<[string, number]> };

expectType<{
  override: string;
  inner: InnerFixture;
  innerDeep: { inner: InnerFixture };
}>({} as Jsonify<NonJsonWithToJSONWrapper>);

class NonJsonWithInvalidToJSON {
  public fixture = new Map<string, number>([
    ["a", 1],
    ["b", 2],
  ]);

  // This is intentionally invalid `.toJSON()`.
  // It is invalid because the result is not assignable to `JsonValue`.
  public toJSON(): { fixture: Map<string, number> } {
    return {
      fixture: this.fixture,
    };
  }
}

const nonJsonWithInvalidToJSON = new NonJsonWithInvalidToJSON();
expectNotAssignable<JsonValue>(nonJsonWithInvalidToJSON);
expectNotAssignable<JsonValue>(nonJsonWithInvalidToJSON.toJSON());

// Not jsonable types; these types behave differently when used as plain values, as members of arrays and as values of objects
declare const undefined_: undefined;
expectNotAssignable<JsonValue>(undefined_);

declare const function_: (_: any) => void;
expectNotAssignable<JsonValue>(function_);

declare const symbol: symbol;
expectNotAssignable<JsonValue>(symbol);

// Plain values fail JSON.stringify()
declare const plainUndefined: Jsonify<undefined>;
expectType<never>(plainUndefined);

declare const plainFunction: Jsonify<(_: any) => void>;
expectType<never>(plainFunction);

declare const plainSymbol: Jsonify<symbol>;
expectType<never>(plainSymbol);

// Array members become null
declare const arrayMemberUndefined: Jsonify<[undefined]>;
expectType<[null]>(arrayMemberUndefined);

declare const arrayMemberUnionWithUndefined: Jsonify<[string | undefined]>;
expectType<[string | null]>(arrayMemberUnionWithUndefined);

declare const arrayMemberUnionWithUndefinedNonTuple: Jsonify<
  (string | undefined)[]
>;
expectType<(string | null)[]>(arrayMemberUnionWithUndefinedNonTuple);

declare const arrayMemberUnionNonJsonable: Jsonify<(undefined | symbol)[]>;
expectType<null[]>(arrayMemberUnionNonJsonable);

declare const arrayMemberUnionPartiallyNonJsonable: Jsonify<
  (symbol | string)[]
>;
expectType<(null | string)[]>(arrayMemberUnionPartiallyNonJsonable);

declare const arrayMemberUnionWithUndefinedDeep: Jsonify<
  [string | undefined] | { foo: Array<string | undefined> }
>;
expectType<[string | null] | { foo: Array<string | null> }>(
  arrayMemberUnionWithUndefinedDeep,
);

declare const arrayMemberFunction: Jsonify<[(_: any) => void]>;
expectType<[null]>(arrayMemberFunction);

declare const arrayMemberSymbol: Jsonify<[symbol]>;
expectType<[null]>(arrayMemberSymbol);

// When used in object values, these keys are filtered
declare const objectValueUndefined: Jsonify<{
  keep: string;
  undefined: typeof undefined_;
}>;
expectType<{ keep: string }>(objectValueUndefined);

declare const objectValueFunction: Jsonify<{
  keep: string;
  fn: typeof function_;
}>;
expectType<{ keep: string }>(objectValueFunction);

declare const objectValueSymbol: Jsonify<{
  keep: string;
  symbol: typeof symbol;
}>;
expectType<{ keep: string }>(objectValueSymbol);

// Symbol keys are filtered
declare const objectKeySymbol: Jsonify<{
  [key: typeof symbol]: number;
  keep: string;
}>;
expectType<{ keep: string }>(objectKeySymbol);

// Number, String and Boolean values are turned into primitive counterparts
declare const number: Number;
expectNotAssignable<JsonValue>(number);

declare const string: String;
expectNotAssignable<JsonValue>(string);

declare const boolean: Boolean;
expectNotAssignable<JsonValue>(boolean);

declare const numberJson: Jsonify<Number>;
expectType<number>(numberJson);

declare const stringJson: Jsonify<String>;
expectType<string>(stringJson);

declare const booleanJson: Jsonify<Boolean>;
expectType<boolean>(booleanJson);

declare const tupleJson: Jsonify<[string, Date]>;
expectType<[string, string]>(tupleJson);

declare const tupleRestJson: Jsonify<[string, ...Date[]]>;
expectType<[string, ...string[]]>(tupleRestJson);

declare const mixTupleJson: Jsonify<["1", (_: any) => void, 2]>;
expectType<["1", null, 2]>(mixTupleJson);

declare const tupleStringJson: Jsonify<readonly ["some value"]>;
expectType<["some value"]>(tupleStringJson);

// BigInt fails JSON.stringify
declare const bigInt: Jsonify<bigint>;
expectType<never>(bigInt);

declare const int8Array: Int8Array;
declare const int8ArrayJson: Jsonify<typeof int8Array>;
expectType<Record<string, number>>(int8ArrayJson);

declare const map: Map<string, number>;
declare const mapJson: Jsonify<typeof map>;
expectType<Record<string, never>>(mapJson);
expectAssignable<EmptyObject>({});

// Regression test for https://github.com/sindresorhus/type-fest/issues/466
expectNotAssignable<Jsonify<Map<string, number>>>(42);
expectNotAssignable<Jsonify<Map<string, number>>>({ foo: 42 });

declare const set: Set<number>;
declare const setJson: Jsonify<typeof set>;
expectType<Record<string, never>>(setJson);
expectAssignable<EmptyObject>({});

// Regression test for https://github.com/sindresorhus/type-fest/issues/466
expectNotAssignable<Jsonify<Set<number>>>(42);
expectNotAssignable<Jsonify<Set<number>>>({ foo: 42 });

// Test that optional type members are not discarded wholesale.
type OptionalPrimitive = {
  a?: string;
};

type OptionalTypeUnion = {
  a?: string | (() => any);
};

type NonOptionalTypeUnion = {
  a: string | undefined;
};

declare const jsonifiedOptionalPrimitive: Jsonify<OptionalPrimitive>;
declare const jsonifiedOptionalTypeUnion: Jsonify<OptionalTypeUnion>;
declare const jsonifiedNonOptionalTypeUnion: Jsonify<NonOptionalTypeUnion>;

expectType<{ a?: string }>(jsonifiedOptionalPrimitive);
expectType<{ a?: string }>(jsonifiedOptionalTypeUnion);
expectType<{ a?: string }>(jsonifiedNonOptionalTypeUnion);

// Test for 'Jsonify support for optional object keys, unserializable object values' #424
// See https://github.com/sindresorhus/type-fest/issues/424
type AppData = {
  // Should be kept
  requiredString: string;
  requiredUnion: number | boolean;

  // Should be kept and set to optional
  optionalString?: string;
  anyProp: any;
  anyPropOptional?: any;
  optionalUnion?: number | string;
  optionalStringUndefined: string | undefined;
  optionalUnionUndefined: number | string | undefined;

  // Should be omitted (all cases non-jsonable)
  requiredFunction: () => any;
  optionalFunction?: () => any;
  optionalFunctionUndefined: (() => any) | undefined;
  optionalFunctionUnionUndefined?: (() => any) | undefined;

  // Should be kept and set to optional
  requiredFunctionUnion: string | (() => any);
  optionalFunctionUnion?: string | (() => any);
};

type ExpectedAppDataJson = {
  requiredString: string;
  requiredUnion: number | boolean;

  optionalString?: string;
  anyProp?: JSON;
  anyPropOptional?: JSON;
  optionalUnion?: string | number;
  optionalStringUndefined?: string;
  optionalUnionUndefined?: string | number;

  requiredFunctionUnion?: string;
  optionalFunctionUnion?: string;
};

declare const response: Jsonify<AppData>;
type Xf44 = typeof response;

expectType<ExpectedAppDataJson>(response);

expectType<{}>({} as Jsonify<EmptyObject>);

declare const objectWithAnyProperty: Jsonify<{ a: any }>;
expectType<{ a?: JSON }>(objectWithAnyProperty);

declare const objectWithAnyProperties: Jsonify<Record<string, any>>;
expectType<Record<string, JSON>>(objectWithAnyProperties);

// Test for `Jsonify` support for nested objects with _only_ a name property.
// See https://github.com/sindresorhus/type-fest/issues/657
declare const nestedObjectWithNameProperty: {
  first: {
    name: string;
  };
};
declare const jsonifiedNestedObjectWithNameProperty: Jsonify<
  typeof nestedObjectWithNameProperty
>;

expectType<typeof nestedObjectWithNameProperty>(
  jsonifiedNestedObjectWithNameProperty,
);

// Regression test for https://github.com/sindresorhus/type-fest/issues/629
declare const readonlyTuple: Jsonify<readonly [1, 2, 3]>;
expectType<[1, 2, 3]>(readonlyTuple);

// `unknown` values
declare const unknownValue: Jsonify<unknown>;
declare const unknownArray: Jsonify<unknown[]>;
declare const unknownTuple: Jsonify<[unknown, unknown]>;
declare const objectWithUnknownValue: Jsonify<{ key: unknown }>;
expectType<JSON>(unknownValue);
expectAssignable<Jsonify<unknown>>("foo");
expectAssignable<Jsonify<unknown>>(["foo"]);
expectNotAssignable<Jsonify<unknown>>(new Date());
expectType<JSON[]>(unknownArray);
expectAssignable<Jsonify<unknown[]>>(["foo"]);
expectType<[string]>(["foo"]);
expectNotAssignable<Jsonify<unknown[]>>([new Date()]);
expectType<[JSON, JSON]>(unknownTuple);
expectAssignable<Jsonify<[unknown, unknown]>>(["foo", "foo"]);
expectNotAssignable<Jsonify<[unknown, unknown]>>([new Date(), new Date()]);
expectType<{ key?: JSON }>(objectWithUnknownValue);
expectAssignable<Jsonify<{ key: unknown }>>({ key: [] });
expectNotAssignable<Jsonify<{ key: unknown }>>({ key: new Date() });

expectAssignable<JsonObject>({} as { a: string });
expectNotAssignable<JsonObject>({} as { a: string | undefined });
expectAssignable<JsonObject>({} as { a?: string });
expectNotAssignable<JsonObject>({} as { a?: string | undefined }); // Requires `exactOptionalPropertyTypes` to be enabled
