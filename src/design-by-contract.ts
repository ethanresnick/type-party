/**
 * Takes a class and returns a type that just contains its public methods and
 * fields. Useful to use as the type for our DI container services, as mocks
 * can satisfy this type (but can't satisfy the class-type because of the nominal
 * treatment that TS gives to classes with private fields; see
 * https://stackoverflow.com/questions/55281162/can-i-force-the-typescript-compiler-to-use-nominal-typing)
 */
export type PublicInterface<T extends object> = { [K in keyof T]: T[K] };

/**
 * Extracts the public method names from a type T, returning a union of string
 * literal types. Also works on plain objects, for which it returns the name of
 * any function-holding properties.
 */
export type PublicMethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];
