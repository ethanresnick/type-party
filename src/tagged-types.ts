import type { Tagged, UnwrapTagged } from 'type-fest';

/**
 * Returns the value it's given, but cast to a compatible tagged type.
 * 
 * This is safer than casting the value directly to the tagged type, as it
 * ensures that the value is compatible with the tagged type's base type.
 *
 * @template TaggedType The tagged type to cast the given value `value` to.
 * @param value The value that is to be cast to the given tagged type.
 */
export function instantiateTaggedType<
  TaggedType extends Tagged<unknown, PropertyKey, unknown>,
>(value: UnwrapTagged<TaggedType>): TaggedType {
  return value as TaggedType;
}
