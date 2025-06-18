/**
 * Returns all the keys from a union of object types.
 *
 * I.e., with a `type T = { a: number, b: string } | { a: boolean }`,
 *
 * I.e., `keyof T` will normally only return `'a'`, because `keyof` with an
 * object type union returns the keys that exist in _every_ constituent of the
 * union. However, AllKeys<T> will return `'a' | 'b'`.
 */
export type AllKeys<T extends object> = T extends object ? keyof T : never;

export type StringKeys<T extends object> = keyof T & string;

export type NullableKeys<T extends object> = {
  [K in keyof T]-?: null extends T[K] ? K : never;
}[keyof T];
