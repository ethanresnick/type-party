import { expectAssignable, expectNotAssignable } from "tsd";
import type { JSON, JSONWithUndefined } from "../types/json.js";

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

// Not assignable to JSON because it is defined as interface idk if this is
// desirable, but it's inherited from type-fest and TS's different handling of
// assignability to index signatures on types vs. interfaces.
// See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#implicit-index-signatures
declare const v: V;

declare const x: X; // Not assignable to JSON because it contains Date value
declare const y: Y; // Not assignable to JSON because it contains Date value

declare const z: Z; // Not assignable to JSON because undefined is not valid JSON value
declare const w: W; // Not assignable to JSON because a function is not valid JSON value

expectAssignable<JSON>(null);
expectAssignable<JSON>(false);
expectAssignable<JSON>(0);
expectAssignable<JSON>("");
expectAssignable<JSON>([]);
expectAssignable<JSON>([] as const);
expectAssignable<JSON>({});
expectAssignable<JSON>([0]);
expectAssignable<JSON>({ a: 0 });
expectAssignable<JSON>({ a: { b: true, c: {} }, d: [{}, 2, "hi"] });
expectAssignable<JSON>([{}, { a: "hi" }, null, 3]);

expectNotAssignable<JSON>(new Date());
expectNotAssignable<JSON>([new Date()]);
expectNotAssignable<JSON>({ a: new Date() });
expectNotAssignable<JSON>(v);
expectNotAssignable<JSON>(x);
expectNotAssignable<JSON>(y);
expectNotAssignable<JSON>(z);
expectNotAssignable<JSON>(w);
expectNotAssignable<JSON>(undefined);
expectNotAssignable<JSON>(5 as number | undefined);

expectAssignable<JSON>(undefined as unknown as { [K in string]: JSON });
expectNotAssignable<JSON>({ undefined: undefined });
expectNotAssignable<JSON>({ [symbol]: symbol });
expectNotAssignable<JSON>({ [symbol]: 3 });

// There's no way, so far as I can tell, to make this test pass without
// making another test fail. Seems to be that TS, behind the scenes,
// maps { [K in string]?: JSON } to { [K in string]: JSON | undefined },
// so, if { [K in string]?: JSON } is part of the JSON type, we end up
// saying that objects with undefined keys are valid JSON.
//
//
// expectAssignable<JSON>(undefined as unknown as { [K in string]?: JSON });

// But we can support the above case for JsonWithUndefined.
expectAssignable<JSONWithUndefined>(
  undefined as unknown as { [K in string]?: JSON },
);

class ExampleClass {
  public fixture = new Map<string, number>([
    ["a", 1],
    ["b", 2],
  ]);
}

const nonJsonWithInvalidToJSON = new ExampleClass();
expectNotAssignable<JSON>(nonJsonWithInvalidToJSON);
expectNotAssignable<JSON>({ fixture: Map<string, number> });

// Not jsonable types; these types behave differently when used as plain values, as members of arrays and as values of objects
declare const undefined_: undefined;
expectNotAssignable<JSON>(undefined_);

declare const function_: (_: any) => void;
expectNotAssignable<JSON>(function_);

declare const symbol: symbol;
expectNotAssignable<JSON>(symbol);
