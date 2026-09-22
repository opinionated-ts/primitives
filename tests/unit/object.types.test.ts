import { describe, expectTypeOf, it } from "vitest";

import type { Exact, IsObject, Simplify, SimplifyDeep } from "@/object.types";

describe("object types", () => {
  it("should identify non-array objects", () => {
    expectTypeOf<IsObject<{ a: 1 }>>().toEqualTypeOf<true>();
    expectTypeOf<IsObject<number[]>>().toEqualTypeOf<false>();
    expectTypeOf<IsObject<string>>().toEqualTypeOf<false>();
    expectTypeOf<IsObject<null>>().toEqualTypeOf<false>();
  });

  it("should flatten intersections", () => {
    expectTypeOf<Simplify<{ a: 1 } & { b: 2 }>>().toEqualTypeOf<{
      a: 1;
      b: 2;
    }>();
  });

  it("should recursively flatten nested object types", () => {
    expectTypeOf<SimplifyDeep<{ a: { b: 1 } & { c: 2 } }>>().toEqualTypeOf<{
      a: {
        b: 1;
        c: 2;
      };
    }>();
  });

  it("should reject extra properties", () => {
    type Actual = Exact<{ a: 1; extra: true }, { a: 1 }>;

    expectTypeOf<Actual["a"]>().toEqualTypeOf<1>();
    expectTypeOf<Actual["extra"]>().toEqualTypeOf<never>();
  });
});
