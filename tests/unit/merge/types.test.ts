import { describe, expectTypeOf, it } from "vitest";

import type { MergeSources } from "@/merge/types";

import { merge, mergeObjects, type Merge } from "@/merge";

describe("merge types", () => {
  it("should recursively merge nested objects and replace leaf values", () => {
    expectTypeOf<
      Merge<{ nested: { a: 1; b: 2 }; value: string }, { nested: { b: 3; c: 4 }; value: number }>
    >().toEqualTypeOf<{
      nested: {
        a: 1;
        b: 3;
        c: 4;
      };
      value: number;
    }>();
  });

  it("should replace arrays instead of merging them", () => {
    expectTypeOf<Merge<{ items: number[] }, { items: string[] }>>().toEqualTypeOf<{
      items: string[];
    }>();
  });

  it("should replace a nested object when the override is a leaf", () => {
    expectTypeOf<Merge<{ config: { debug: boolean } }, { config: string }>>().toEqualTypeOf<{
      config: string;
    }>();
  });

  it("should replace a leaf when the override is an object", () => {
    expectTypeOf<Merge<{ config: string }, { config: { debug: boolean } }>>().toEqualTypeOf<{
      config: {
        debug: boolean;
      };
    }>();
  });

  it("should preserve properties that exist only in the base", () => {
    expectTypeOf<Merge<{ name: string; port: number }, { name: "Daniel" }>>().toEqualTypeOf<{
      name: "Daniel";
      port: number;
    }>();
  });

  it("should preserve properties that exist only in the override", () => {
    expectTypeOf<Merge<{ name: string }, { age: number }>>().toEqualTypeOf<{
      name: string;
      age: number;
    }>();
  });

  it("should merge multiple sources from left to right", () => {
    expectTypeOf<
      MergeSources<
        [
          { name: "Daniel" },
          { config: { debug: false } },
          { age: 30 },
          { config: { timeout: 5000 } },
        ]
      >
    >().toEqualTypeOf<{
      name: "Daniel";
      config: {
        debug: false;
        timeout: 5000;
      };
      age: 30;
    }>();
  });

  it("should ignore undefined sources", () => {
    expectTypeOf<
      MergeSources<[{ name: string }, undefined, { age: number }, undefined]>
    >().toEqualTypeOf<{
      name: string;
      age: number;
    }>();
  });

  it("should resolve an empty source list to an empty object", () => {
    expectTypeOf<MergeSources<[]>>().toEqualTypeOf<{}>();
  });

  it("should preserve readonly properties", () => {
    expectTypeOf<Merge<{ readonly name: string }, { readonly age: number }>>().toEqualTypeOf<{
      readonly name: string;
      readonly age: number;
    }>();
  });

  it("should preserve optional properties", () => {
    expectTypeOf<
      Merge<{ name: string; optional?: { debug: boolean } }, { age: number }>
    >().toEqualTypeOf<{
      name: string;
      optional?: {
        debug: boolean;
      };
      age: number;
    }>();
  });
});

describe("mergeObjects inference", () => {
  it("should infer the merged object type", () => {
    const result = mergeObjects(
      {
        name: "Daniel",
        config: {
          debug: false,
          theme: "dark",
        },
      },
      {
        age: 30,
        config: {
          timeout: 5000,
        },
      },
    );

    expectTypeOf(result).toEqualTypeOf<{
      readonly name: "Daniel";
      readonly config: {
        readonly debug: false;
        readonly theme: "dark";
        readonly timeout: 5000;
      };
      readonly age: 30;
    }>();
  });
});

describe("merge inference", () => {
  it("should infer the merged type across multiple sources", () => {
    const result = merge(
      {
        name: "Daniel",
      },
      {
        config: {
          debug: false,
        },
      },
      {
        age: 30,
      },
      {
        config: {
          timeout: 5000,
        },
      },
    );

    expectTypeOf(result).toEqualTypeOf<{
      readonly name: "Daniel";
      readonly config: {
        readonly debug: false;
        readonly timeout: 5000;
      };
      readonly age: 30;
    }>();
  });

  it("should ignore undefined sources in the inferred type", () => {
    const optionalConfig:
      | {
          config: {
            debug: false;
          };
        }
      | undefined = undefined;

    const result = merge({ name: "Daniel" }, optionalConfig, { age: 30 });

    expectTypeOf(result).toEqualTypeOf<{
      readonly name: "Daniel";
      readonly age: 30;
    }>();
  });

  it("should infer an empty object when no sources are provided", () => {
    expectTypeOf(merge()).toEqualTypeOf<{}>();
  });
});
