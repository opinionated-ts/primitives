/**
 * Flattens an intersection into a regular object type.
 *
 * This is primarily useful for improving the readability of inferred types
 * in editor hovers by materializing the resulting property structure.
 *
 * @typeParam T - Type to simplify.
 */
export type Simplify<T> = {
  [Key in keyof T]: T[Key];
};

/**
 * Recursively flattens an object type while preserving arrays and other
 * non-object values.
 *
 * This is primarily useful for making deeply merged inferred types easier to
 * read in editor hovers.
 *
 * @typeParam T - Type to simplify recursively.
 */
export type SimplifyDeep<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? {
        [Key in keyof T]: SimplifyDeep<T[Key]>;
      }
    : T;

/**
 * Determines whether `T` is a non-array object.
 *
 * Arrays are excluded because they are treated as leaf values by the
 * recursive merge utilities. Non-object values are also excluded.
 *
 * @typeParam T - Type to inspect.
 */
export type IsObject<T> = T extends object ? (T extends readonly unknown[] ? false : true) : false;

/**
 * Rejects properties that are not present in `Allowed`.
 *
 * This check is applied at the current object level. Nested objects are
 * validated through their own recursive mapped types.
 *
 * @typeParam Options - Candidate options supplied by the caller.
 * @typeParam Allowed - Properties that are permitted at this level.
 */
export type Exact<Options, Allowed> = Options &
  Record<Exclude<keyof Options, keyof Allowed>, never>;
