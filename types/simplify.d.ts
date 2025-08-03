export type DrainOuterGeneric<T> = [T] extends [unknown] ? T : never;

export type Simplify<T> = DrainOuterGeneric<{ [K in keyof T]: T[K] } & {}>;
