/**
 * Apply this to a type that's NOT a conditional type (like a mapped type or an
 * indexed access type) to prevent the computations required to resolve that
 * type from contributing to Typescript's internal type instantiation depth
 * counter, thereby preventing many "Type instantiation is excessively deep and
 * possibly infinite" errors.
 *
 * See Kysely type of the same name for more details.
 */
export type DrainOuterGeneric<T> = [T] extends [unknown] ? T : never;

export type Simplify<T> = DrainOuterGeneric<{ [K in keyof T]: T[K] } & {}>;
