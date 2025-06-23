// dates are turned into strings when serialized to JSON, so we want to

import type { Tagged } from "type-fest";

// distinguish them from arbitrary strings
export type DateString = Tagged<string, "DateString">;

/**
 * NB: will throw for invalid dates.
 */
export function makeDateString(date: Date): DateString {
  return date.toISOString() as DateString;
}

export function parseDateString(dateString: DateString): Date {
  return new Date(dateString);
}
