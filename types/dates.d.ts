import type { Tagged } from "type-fest";

// dates are turned into strings when serialized to JSON, so we want to
// distinguish them from arbitrary strings
export type DateString = Tagged<string, "DateString">;
