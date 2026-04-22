import type { JsonPrimitive, Tagged, TypedArray } from "type-fest";
import type { DrainOuterGeneric, Simplify } from "./simplify.d.ts";

export type JSON =
  | { [key: string]: JSON }
  | { readonly [key: string]: JSON }
  | JSON[]
  | readonly JSON[]
  | number
  | string
  | boolean
  | null;

/**
 * Same as JSON, but allows types that have optional keys (which just get
 * omitted at JSON serialization time) and keys that are allowed to contain
 * undefined, which, if actually set to undefined, also get omitted at JSON
 * serialization time. This is necessary only because we're not using TS'
 * exactOptionalPropertyTypes, so sometimes we get a type where TS thinks a key
 * could hold undefined (when we actually expect it to be missing or not
 * undefined).
 */
export type JSONWithUndefined =
  | { [key: string]: JSONWithUndefined }
  | { readonly [key: string]: JSONWithUndefined }
  | JSONWithUndefined[]
  | readonly JSONWithUndefined[]
  | number
  | string
  | boolean
  | null
  | undefined;

export type JsonOf<T> = Tagged<string, "JSON", T>;

// Note: The return value has to be `any` and not `unknown` so it can match `void`.
export type NotJsonable = ((...arguments_: any[]) => any) | undefined | symbol;

type NotJsonableToNull<T> = T extends NotJsonable ? null : T;
type IsUnknownOrAny<T> = unknown extends T ? true : false;

// Handles tuples and arrays
type JsonifyList<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer F, ...infer R]
    ? [Jsonify<NotJsonableToNull<F>>, ...JsonifyList<R>]
    : Array<Jsonify<NotJsonableToNull<T[number]>>>;

/**
 * Returns the type that you'd get from running
 * `JSON.parse(JSON.stringify(value))` on a value of type `T`.
 *
 * Note that this is `never` for types where the above expression throws. E.g.,
 * `JSON.parse(JSON.stringify(undefined))` throws, so `Jsonify<undefined>` is
 * `never`.
 *
 * Non-JSON-roundtrippable values that implement `.toJSON()` (e.g., `Date`) are
 * transformed into their `.toJSON()` return type. Undefined, null, etc are
 * similarly accounted for.
 *
 * @example
 * ```
 * const example = {
 *   [Symbol()]: true,      // symbol keys are removed by JSON.stringify
 *   something: undefined,  // ditto for undefined values
 *   date: new Date(),      // Date.toJSON() returns a string
 *   arr: [undefined, "hi"] // undefined in arrays become null
 * } as const;
 *
 * // `Jsonify<typeof example>` is `{ date: string, arr: [null, string] }`
 * const exampleJson = JSON.parse(JSON.stringify(example)) as Jsonify<typeof example>;
 * ```
 */
export type Jsonify<T> =
  IsUnknownOrAny<T> extends true
    ? JSON
    : T extends JsonPrimitive
      ? T
      : // Any object with toJSON is special case
        T extends { toJSON(): infer J }
        ? J extends JSON
          ? J
          : Jsonify<J>
        : T extends readonly unknown[]
          ? JsonifyList<T>
          : T extends NotJsonable
            ? never
            : // Special case certain objects
              T extends Map<any, any> | Set<any> | RegExp
              ? Record<string, never>
              : T extends RareObject
                ? JsonifyRareObject<T>
                : T extends object
                  ? JsonifyObject<T>
                  : never;

// TypedArrays and boxed primitives
type RareObject = TypedArray | Number | String | Boolean;

type JsonifyRareObject<T extends RareObject> = T extends TypedArray
  ? Record<string, number>
  : T extends Number
    ? number
    : T extends String
      ? string
      : T extends Boolean
        ? boolean
        : never;

// Preserve original required status if _every_ possible value is jsonable
// (which also means the type isn't any or unknown).
//
// Omit properties that have a non-jsonable key (symbol keys) or _only_ have
// non-jsonable values.
//
// Set as optional (via `?`) properties that could have a non-jsonable values,
// but don't exclusively.
type JsonifyObjectInner<T extends object> = Simplify<
  {
    [Key in keyof T as IsUnknownOrAny<T[Key]> extends true
      ? never
      : Key extends symbol
        ? never
        : T[Key] extends Exclude<T[Key], NotJsonable>
          ? Key
          : never]: Jsonify<T[Key]>;
  } & {
    [Key in keyof T as IsUnknownOrAny<T[Key]> extends true
      ? Key
      : Key extends symbol
        ? never
        : Exclude<T[Key], NotJsonable> extends never
          ? never
          : Key]?: Jsonify<T[Key]>;
  }
>;

// Sometimes, when Record<> is involved and that gets converted to an index
// signature, the value type gets undefined tacked on (because index signatures
// can't be optional), so this removes it.
type JsonifyObject<T extends object> = DrainOuterGeneric<{
  [K in keyof JsonifyObjectInner<T>]: Exclude<
    JsonifyObjectInner<T>[K],
    undefined
  >;
}>;
