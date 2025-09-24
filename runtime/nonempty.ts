import type { PreserveReadonly } from "../types/arrays-and-tuples.d.ts";
import type { NonEmptyArray, NonEmptyString } from "../types/nonempty.d.ts";

export function isNonEmptyString(it: unknown): it is NonEmptyString {
  return typeof it === "string" && it !== "";
}

export function isNonEmptyArray<T>(arr: Array<T>): arr is NonEmptyArray<T>;
export function isNonEmptyArray<T>(
  arr: ReadonlyArray<T>,
): arr is Readonly<NonEmptyArray<T>>;
export function isNonEmptyArray<T>(
  arr: Readonly<Array<T>>,
): arr is Readonly<NonEmptyArray<T>> {
  return arr.length > 0;
}

export function mapNonEmpty<T extends Readonly<NonEmptyArray<unknown>>, U>(
  arr: T,
  fn: (it: T[number]) => U,
): { [K in keyof T]: U } {
  return arr.map(fn) as { [K in keyof T]: U };
}
