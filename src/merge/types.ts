import type { IsObject, Simplify, SimplifyDeep } from "@/object.types";

/**
 * Recursively merges a tuple of sources from left to right.
 *
 * `undefined` and non-object sources are ignored. The accumulated result is
 * passed to the next source until all sources have been processed.
 *
 * @typeParam Sources - Remaining sources to merge.
 * @typeParam Result - Accumulated merged result.
 *
 * @internal
 */
type MergeSourcesImpl<
  Sources extends readonly unknown[],
  Result extends object = {},
> = Sources extends readonly [infer Source, ...infer Rest]
  ? [Source] extends [undefined]
    ? MergeSourcesImpl<Rest, Result>
    : Exclude<Source, undefined> extends infer DefinedSource
      ? DefinedSource extends object
        ? MergeSourcesImpl<Rest, MergeImpl<Result, DefinedSource>>
        : MergeSourcesImpl<Rest, Result>
      : MergeSourcesImpl<Rest, Result>
  : Result;

/**
 * Recursively merges a tuple of object types from left to right.
 *
 * `undefined` and non-object sources are ignored.
 *
 * @typeParam Sources - Object types to merge in order.
 */
export type MergeSources<Sources extends readonly unknown[]> = SimplifyDeep<
  MergeSourcesImpl<Sources>
>;

/**
 * Recursively merges two types.
 *
 * When both values are objects, their properties are merged recursively.
 * Otherwise, `Override` completely replaces `Base`.
 *
 * @typeParam Base - Base type whose properties provide the initial values.
 * @typeParam Override - Type whose properties override or extend `Base`.
 */
export type Merge<Base, Override> = SimplifyDeep<MergeImpl<Base, Override>>;

/**
 * Recursively resolves the merge of two types.
 *
 * Plain objects are merged recursively. Arrays, non-object values, and other
 * non-mergeable values are treated as leaves, with `Override` replacing `Base`.
 *
 * @typeParam Base - Base type being merged.
 * @typeParam Override - Type whose properties take precedence.
 *
 * @internal
 */
type MergeImpl<Base, Override> = Base extends object
  ? Override extends object
    ? IsObject<Base> extends true
      ? IsObject<Override> extends true
        ? MergeObjects<Base, Override>
        : Override
      : Override
    : Override
  : Override;

/**
 * Merges two object types while recursively resolving overlapping properties.
 *
 * Properties present only in `Base` are preserved. Properties from `Override`
 * replace matching properties from `Base`, and overlapping object properties
 * are merged recursively.
 *
 * @typeParam Base - Base object type.
 * @typeParam Override - Object type whose properties take precedence.
 *
 * @internal
 */
type MergeObjects<Base extends object, Override extends object> = Simplify<
  Omit<Base, keyof Override> & {
    [Key in keyof Override]: Key extends keyof Base
      ? MergeImpl<Base[Key], Override[Key]>
      : Override[Key];
  }
>;
