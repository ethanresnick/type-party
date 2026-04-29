import type tag from "tagged-tag";
import type {
  IsEqual,
  JsonPrimitive,
  PickIndexSignature,
  Tagged,
  TypedArray,
  UnionToIntersection,
  UnwrapTagged,
} from "type-fest";
import type { Simplify } from "./simplify.d.ts";

export type JSON =
  | { readonly [key: string]: JSON; readonly [key: symbol]: never }
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
  | {
      readonly [key: string]: JSONWithUndefined | undefined;
      readonly [key: symbol]: never;
    }
  | ({ readonly [x in string]?: JSONWithUndefined | undefined } & {
      readonly [x in symbol]?: never;
    })
  | JSONWithUndefined[]
  | readonly JSONWithUndefined[]
  | number
  | string
  | boolean
  | null;

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
    : // When we have _exactly_ the JSON type, this prevents some infinite type
      // errors; see caveats below about `T extends JSON` more generally.
      IsEqual<T, JSON> extends true
      ? T
      : // If the value is a tagged type with a JSON-roundtrippable base type, return
        // it as-is. Since the base type didn't change (including us not
        // removing readonly), any tags are still valid. If the base type isn't
        // JSON-roundtrippable as-is, we can't safely keep the tags. (Note: if
        // the base type has nested `any`s that mask non-JSON-roundtrippable
        // values, the retained tags may be invalid after all post-parse, but we
        // ignore that case for now.)
        //
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        T extends Tagged<unknown, PropertyKey, any>
        ? UnwrapTagged<T> extends JSON
          ? AddTags<UnwrapTagged<T>, T[typeof tag]>
          : Jsonify<UnwrapTagged<T>>
        : // NB: you might want to take the `UnwrapTagged<T> extends JSON` check we
          // did above and apply its logic (if type extends JSON, the Jsonify
          // result won't change) to untagged input types too. But the problem is
          // that: 1) Jsonifying should arguably remove readonly when values are
          // untagged, but just returning T wont; and 2) we won't end up
          // converting inner `any`s to `JSON if we return T as-is`; and 3) most
          // importantly, checking assignablility to JSON at all seems to cause
          // more 'type excessively deep and possibly infinite' errors! So, we
          // skip a `T extends JSON ? JsonWritableDeep<T>` check (where
          // `JsonWritableDeep` would be a version of type-fest's `WritableDeep`
          // specialized to only allow JSON-roundtrippable values, to avoid the
          // excessively deep type error).
          T extends JsonPrimitive
          ? T
          : // Any object with toJSON is special case
            T extends { toJSON(): infer J }
            ? Jsonify<J>
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
// signature, or perhaps an index signature was involved directly, the value
// type gets undefined tacked onto it (because index signatures can't be
// optional), so this removes it.
type JsonifyObject<T extends object> =
  // This short-circuit can avoid some infinite type errors.
  IsEqual<T, PickIndexSignature<T>> extends true
    ? { [K in keyof T]: Jsonify<T[K & string]> }
    : {
        [K in keyof JsonifyObjectInner<T>]: Exclude<
          JsonifyObjectInner<T>[K],
          undefined
        >;
      };

type AddTags<T, Tags> = UnionToIntersection<
  { [K in keyof Tags]: Tagged<T, K, Tags[K]> }[keyof Tags]
>;
