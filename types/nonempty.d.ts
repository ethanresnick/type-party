import type { Tagged } from "type-fest";

export type NonEmptyString = Tagged<string, "NonEmptyString">;

export type NonEmptyArray<T> = [T, ...T[]];
