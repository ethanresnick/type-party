import type { Tagged } from "type-fest";

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
