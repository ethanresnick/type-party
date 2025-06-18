import type { Tagged } from "type-fest";

export type NonEmptyString = Tagged<string, "NonEmptyString">;

export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmptyString(it: unknown): it is NonEmptyString {
  return typeof it === "string" && it !== "";
}

export function isNonEmptyArray<T>(arr: Array<T>): arr is NonEmptyArray<T>;
export function isNonEmptyArray<T>(
  arr: ReadonlyArray<T>
): arr is Readonly<NonEmptyArray<T>>;
export function isNonEmptyArray<T>(
  arr: Readonly<Array<T>>
): arr is Readonly<NonEmptyArray<T>> {
  return arr.length > 0;
}
