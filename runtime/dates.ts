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

export function isDateString(dateString: string): dateString is DateString {
  // Let's define any string that round-trip's through new Date while staying
  // valid as a DateString.
  const date = new Date(dateString);
  return !Number.isNaN(date.valueOf()) && date.toISOString() === dateString;
}
