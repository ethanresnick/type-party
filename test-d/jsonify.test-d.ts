/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { expectAssignable, expectNotAssignable, expectType } from "tsd";
import type { EmptyObject, JsonObject, JsonValue, Tagged } from "type-fest";
import type { JSON, Jsonify } from "../types/json.js";

interface X {
  a: Date;
}

declare const symbol: symbol;

type Geometry = {
  type: "Point" | "Polygon";
  coordinates: [number, number];
};

const point: Geometry = {
  type: "Point",
  coordinates: [1, 1],
};

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
  undefined: undefined;
}>;
expectType<{ keep: string }>(objectValueUndefined);

declare const objectValueFunction: Jsonify<{
  keep: string;
  fn: (_: any) => void;
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
  //jsonProp: JSON;

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
  //jsonProp: JSON;

  requiredFunctionUnion?: string;
  optionalFunctionUnion?: string;
};

declare const response: Jsonify<AppData>;

expectType<ExpectedAppDataJson>(response);

declare const emptyObject: Jsonify<EmptyObject>;
expectType<{}>(emptyObject);

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

// Test with constrained types + tagged types + index signatures (including with undefined)
type AnyParamValue = Exclude<JSON, null>;
type AnyParams = { readonly [ParamName in string]: AnyParamValue | undefined };
type AnyParams2 = { [k: string]: AnyParamValue | undefined };

type Vary<Params> = {
  [K in keyof Params]?: Exclude<Params[K], undefined> | null;
};

// The Vary object, after param names and values have been normalized.
type NormalizedVary<Params> = Tagged<Vary<Params>, "NormalizedVary">;

type ConcreteParams = { test: string | undefined; b: true };

declare const anyParams: Jsonify<AnyParams>;
declare const anyParams2: Jsonify<AnyParams2>;
declare const varyAnyParams: Jsonify<Vary<AnyParams>>;
declare const varyConcreteParams: Jsonify<Vary<ConcreteParams>>;

declare const normalizedVaryConcreteParams: Jsonify<
  NormalizedVary<ConcreteParams>
>;

expectAssignable<{ readonly [k: string]: AnyParamValue }>(anyParams);
expectAssignable<{ readonly [k in string]: AnyParamValue }>(anyParams);

expectAssignable<{ [k: string]: AnyParamValue }>(anyParams);
expectAssignable<{ [x in string]: AnyParamValue }>(anyParams2);

expectAssignable<{ readonly [k: string]: AnyParamValue | null }>(varyAnyParams);
expectAssignable<{ [x in string]: AnyParamValue | null }>(varyAnyParams);

expectType<Vary<ConcreteParams>>(varyConcreteParams);
expectType<{ test?: string | null; b?: true | null }>(varyConcreteParams);

expectType<NormalizedVary<ConcreteParams>>(normalizedVaryConcreteParams);

// The expectType below fails because `Vary<AnyParams> extends JSON` is false,
// because TS adds `undefined` to the value type of Vary<AnyParams>`, even
// though we're using exactOptionalPropertyTypes and don't write undefined. That
// does not happen when `Params` is a concrete type, but something about the
// interaction of the index signature on `AnyParams` (which, like all index
// signatures, is required) getting forced to optional in the Vary mapped type
// is probably leading `undefined` to be added to the value type.
//
// type _ = Vary<AnyParams> extends JSON ? true : false; declare const
// normalizedVaryAnyParams: Jsonify<NormalizedVary<AnyParams>>;
// expectType<NormalizedVary<AnyParams>>(normalizedVaryAnyParams);
