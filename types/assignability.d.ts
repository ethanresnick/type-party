import { IsEqual } from "type-fest";

/**
 * Returns the first type parameter, while giving a type error if the first
 * parameter's type isn't assignable to the second parameter's type.
 *
 * This is like a type-level equivalent of the `satisfies` operator: in the same
 * way that you'd write `exprOfTypeT satisfies U` to get the `exprOfTypeT` typed
 * as `T` while ensuring that the type is a `U`, you can write `Satisfies<T, U>`
 * to get a type `T` while ensuring that it's assignable to `U`.
 */
export type Satisfies<T extends U, U> = T;

/**
 * Returns the first type parameter, while enforcing that it's a supertype of
 * the second parameter.
 */
export type SatisfiedBy<T, _U extends T> = T;

/**
 * Returns true if the three types are equal; else false.
 */
export type IsEqual3<T, U, V> =
  IsEqual<T, U> extends true
    ? IsEqual<U, V> extends true
      ? true
      : false
    : false;
