# type-party

Extends `type-fest` with extra goodies.

Mostly contains pure TS types, but also includes some type predicates and runtime utilities -- although those are all exported under separate entrypoints, so won't be loaded by default.

## Install

```sh
npm install type-party
```

Use as:

```
// To get a pure type
import type { XXXX } from "type-party";

// To get one of the runtime exports.
// See package.json for the available /runtime/xyz.js export paths.
import { XXX } from "type-party/runtime/json.js"
```

## Types

### Array & Tuple Types

- [`Filter<T, U>`](types/arrays-and-tuples.d.ts) &mdash; Filters an array or tuple type, keeping only elements that extend type `U`. Preserves tuple structure and readonly properties.

- [`PreserveReadonly<T, V>`](types/arrays-and-tuples.d.ts) &mdash; Utility that preserves the `readonly` nature of an array type when transforming it to another array type. This simplifies building utility types that transform array types.

### Assignability & Type Safety

- [`Satisfies<T, U>`](types/assignability.d.ts) &mdash; Type-level equivalent of the `satisfies` operator. Returns type `T` while ensuring it's assignable to `U`. This can be very useful for keeping types in sync or setting up various type-level "alarms" for when some expected invariant gets broken.

- [`SatisfiedBy<T, U>`](types/assignability.d.ts) &mdash; Returns the first type parameter while enforcing that it's a supertype of the second parameter.

### Date Types

- [`DateString`](types/dates.d.ts) &mdash; Tagged string type for date strings, useful for distinguishing dates from arbitrary strings in JSON contexts. Import from `type-party/runtime/dates.js` to get the relevant functions for creating/parsing these.

### Design by Contract

- [`PublicInterface<T>`](types/design-by-contract.d.ts) &mdash; Extracts only the public methods and fields from a class type. Useful for dependency injection where mocks need to satisfy the interface without private implementation details.

- [`PublicMethodNames<T>`](types/design-by-contract.d.ts) &mdash; Extracts the public method names from a type, returning a union of string literal types.

### Discriminated Union Helpers

- [`CollapseCases<T>`](types/discriminated-unions.d.ts) &mdash; Takes a union of object types and returns a single object type where each key's type is the union of types for that key across all cases. This is useful in cases where TS can't correctly figure out the assignability of complex union types with correlated key types. As a very simple example, see

- [`CollapseCasesDeep<T>`](types/discriminated-unions.d.ts) &mdash; Like `CollapseCases`, but works recursively on nested object types within discriminated unions.

### Function Types

- [`AnyFunction`](types/functions.d.ts) &mdash; Type alias for any function: `(...args: any) => any`.

- [`CallSignature<T>`](types/functions.d.ts) &mdash; Extracts just the call signature from a function type that may have additional properties.

- [`Bind1<F, A0>`](types/functions.d.ts), [`Bind2<F, A0, A1>`](types/functions.d.ts), [`Bind3<F, A0, A1, A2>`](types/functions.d.ts), [`Bind4<F, A0, A1, A2, A3>`](types/functions.d.ts) &mdash; Types for binding the first N arguments of a function, returning a new function type with those arguments pre-bound.

### JSON Types

- [`JSON`](types/json.d.ts) &mdash; Represents valid JSON values: objects, arrays, strings, numbers, booleans, and null.

- [`JSONWithUndefined`](types/json.d.ts) &mdash; Like `JSON`, but allows types with optional keys and undefined values that get omitted during JSON serialization.

- [`JsonOf<T>`](types/json.d.ts) &mdash; Tagged string type representing a JSON serialization of type `T`.

### Math & Numeric Types

- [`NumericRange<Min, Max>`](types/math.d.ts) &mdash; Creates a union type of numbers from `Min` to `Max` (inclusive).

- [`Permutations<T>`](types/math.d.ts) &mdash; Generates all possible permutations of a tuple type using tuple length arithmetic.

### Non-empty Types

- [`NonEmptyString`](types/nonempty.d.ts) &mdash; Tagged string type that represents a non-empty string.

- [`NonEmptyArray<T>`](types/nonempty.d.ts) &mdash; Array type that guarantees at least one element: `[T, ...T[]]`.

### Nullish Handling

- [`RemoveUndefinedDeep<T>`](types/nullish-handling.d.ts) &mdash; Recursively removes `undefined` from a type, useful for converting `JSONWithUndefined` to `JSON`.

### Object Key Manipulation

- [`AllKeys<T>`](types/object-keys.d.ts) &mdash; Returns all keys from a union of object types, unlike `keyof` which only returns keys present in every union member.

- [`StringKeys<T>`](types/object-keys.d.ts) &mdash; Filters object keys to only string keys.

- [`NullableKeys<T>`](types/object-keys.d.ts) &mdash; Returns keys from an object type where the value can be null.

- [`NarrowKeys<T, K, V>`](types/object-keys.d.ts) &mdash; Narrows specific keys in an object type to a more specific value type when there's type compatibility.

### Type Simplification

- [`Simplify<T>`](types/simplify.d.ts) &mdash; Flattens intersection types into a single object type for better IDE display.

- [`DrainOuterGeneric<T>`](types/simplify.d.ts) &mdash; Prevents type computations from contributing to TypeScript's instantiation depth counter, helping avoid "excessively deep" errors.

- [`DepthCapped<T, DepthLimit?, AtDepthLimitType?>`](types/simplify.d.ts) &mdash; Limits the nesting depth of recursive types to prevent TypeScript compiler performance issues. When depth limit is reached, deeper structures are replaced with the specified type (defaults to `any`).

### Type Mapping

- [`PickEach<Union, Keys>`](types/type-mapping.d.ts) &mdash; Like `Pick`, but preserves union structure instead of merging picked properties across union members.

- [`ReplaceDeep<Type, Search, Replacement>`](types/type-mapping.d.ts) &mdash; Recursively replaces all instances of `Search` type with `Replacement` type throughout a complex type structure.
