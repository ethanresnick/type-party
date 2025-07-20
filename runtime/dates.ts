import type { DateString } from "../types/dates.d.ts";

/**
 * NB: will throw for invalid dates.
 */
export function makeDateString(date: Date): DateString {
  return date.toISOString() as DateString;
}

export function parseDateString(dateString: DateString): Date {
  return new Date(dateString);
}
