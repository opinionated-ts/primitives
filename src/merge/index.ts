import type { Merge, MergeSources } from "./types";

/**
 * Determines whether a value is a plain object that can be recursively merged.
 *
 * Only objects whose prototype is `Object.prototype` or `null` are considered
 * mergeable. Arrays, `null`, class instances, and other object types are
 * treated as leaf values and are replaced rather than merged recursively.
 *
 * @param value - Value to test.
 * @returns `true` when `value` is a mergeable plain object.
 */
export function isMergeableObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

/**
 * Recursively merges two plain objects without mutating either input.
 *
 * Properties from `override` take precedence over properties from `base`.
 * Properties that exist only in `base` are preserved, while overlapping
 * mergeable plain objects are merged recursively. Arrays, class instances,
 * and other non-mergeable values replace the corresponding value from `base`.
 *
 * Unlike {@link merge}, this function accepts exactly two objects.
 *
 * @param base - Object providing the initial properties.
 * @param override - Object whose properties override or extend `base`.
 * @returns A new object containing the recursively merged properties.
 */
export function mergeObjects<
  const Base extends Record<string, unknown>,
  const Override extends Record<string, unknown>,
>(base: Base, override: Override): Merge<Base, Override> {
  const result = { ...base };

  mergeInto(result, override);

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- runtime merge guarantees this shape
  return result as Merge<Base, Override>;
}

/**
 * Recursively merges the properties of `source` into `result`.
 *
 * This operation mutates `result` directly and does not create a new root
 * object. Overlapping mergeable plain objects are merged recursively, while
 * arrays, class instances, and other non-mergeable values replace the existing
 * property in `result`.
 *
 * This is an internal implementation helper used by {@link mergeObjects} and
 * {@link merge}.
 *
 * @param result - Object that receives the merged properties and is mutated.
 * @param source - Object whose own enumerable properties are merged into
 * `result`.
 */
export function mergeInto(result: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(source)) {
    const value = source[key];
    const current = result[key];

    if (isMergeableObject(current) && isMergeableObject(value)) {
      result[key] = mergeObjects(current, value);
      continue;
    }

    result[key] = value;
  }
}

/**
 * Recursively merges any number of objects from left to right without
 * mutating any of the input objects.
 *
 * Each source is applied in order, so properties from later sources take
 * precedence over earlier sources. Overlapping mergeable plain objects are
 * merged recursively, while arrays, class instances, and other non-mergeable
 * values replace the previous value. `undefined` sources are ignored.
 *
 * Unlike {@link mergeObjects}, this function accepts any number of sources.
 *
 * @param sources - Objects to merge from left to right.
 * @returns A new object containing the recursively merged properties.
 */
export function merge<const Sources extends readonly (Record<string, unknown> | undefined)[]>(
  ...sources: Sources
): MergeSources<Sources> {
  const result: Record<string, unknown> = {};

  for (const source of sources) {
    if (source !== undefined) {
      mergeInto(result, source);
    }
  }

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- runtime merge guarantees this shape
  return result as MergeSources<Sources>;
}

export type { Merge } from "./types";
