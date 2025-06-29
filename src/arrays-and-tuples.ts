export type Filter<T, U> = T extends [infer F, ...infer R]
  ? F extends U
    ? [F, ...Filter<R, U>]
    : Filter<R, U>
  : [];