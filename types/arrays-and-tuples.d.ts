export type Filter<T, U> = T extends readonly [infer F, ...infer R]
  ? // If we know there's a first element (i.e., non-empty tuple type), process
    // element by element. If F is narrower than U, keep F as-is and filter the
    // rest of the array. If U and F have no overlap, remove the element and
    // filter the rest of the array. If F _might_ be U at runtime, branch the
    // result.
    F extends U
    ? PreserveReadonly<T, [F, ...Filter<R, U>]>
    : F & U extends never
      ? PreserveReadonly<T, Filter<R, U>>
      :
          | PreserveReadonly<T, [U & F, ...Filter<R, U>]>
          | PreserveReadonly<T, Filter<R, U>>
  : // Tuple base-case
    T extends readonly []
    ? PreserveReadonly<T, []>
    : // Otherwise, process the array as a whole
      T extends readonly (infer I)[]
      ? PreserveReadonly<T, (I & U)[]>
      : never;

export type PreserveReadonly<T, V extends ReadonlyArray<any>> =
  // inner branch is to deal with `any`
  Readonly<T> extends T ? (V extends unknown ? Readonly<V> : never) : V;
