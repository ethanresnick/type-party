import { expectType } from "tsd";
import type { Filter } from "../types/arrays-and-tuples.js";

declare const arr: (number | string)[];
declare const arr2: readonly (number | string)[];

declare const tuple: [number, string];
declare const tuple2: [number, string, string | number];
declare const tuple3: readonly [number, string];
declare const tuple4: readonly [number, string, string | number];

declare const filteredArr: Filter<typeof arr, number>;
declare const filteredArr2: Filter<typeof arr, string>;

declare const filteredArr3: Filter<typeof arr2, number>;
declare const filteredArr4: Filter<typeof arr2, string>;

declare const filteredTuple: Filter<typeof tuple, number>;
declare const filteredTuple2: Filter<typeof tuple, string>;

declare const filteredTuple3: Filter<typeof tuple2, number>;
declare const filteredTuple4: Filter<typeof tuple2, string>;

declare const filteredTuple5: Filter<typeof tuple3, number>;
declare const filteredTuple6: Filter<typeof tuple3, string>;

declare const filteredTuple7: Filter<typeof tuple4, number>;
declare const filteredTuple8: Filter<typeof tuple4, string>;

expectType<number[]>(filteredArr);
expectType<string[]>(filteredArr2);

expectType<readonly number[]>(filteredArr3);
expectType<readonly string[]>(filteredArr4);

expectType<[number]>(filteredTuple);
expectType<[string]>(filteredTuple2);

expectType<[number] | [number, number]>(filteredTuple3);
expectType<[string] | [string, string]>(filteredTuple4);

expectType<readonly [number]>(filteredTuple5);
expectType<readonly [string]>(filteredTuple6);

expectType<readonly [number] | readonly [number, number]>(filteredTuple7);
expectType<readonly [string] | readonly [string, string]>(filteredTuple8);
