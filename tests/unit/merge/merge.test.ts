import { describe, expect, it } from "vitest";

import { merge, mergeInto, mergeObjects } from "@/index";

describe("mergeObjects", () => {
  // existing tests...

  it("should not mutate nested objects from either input", () => {
    const base = {
      config: {
        debug: false,
      },
    };

    const override = {
      config: {
        timeout: 5000,
      },
    };

    const result = mergeObjects(base, override);

    expect(result.config).not.toBe(base.config);
    expect(result.config).not.toBe(override.config);

    expect(base).toEqual({
      config: {
        debug: false,
      },
    });

    expect(override).toEqual({
      config: {
        timeout: 5000,
      },
    });
  });
});

describe("mergeInto", () => {
  // existing test...

  it("should mutate only the target object", () => {
    const result = {
      config: {
        debug: false,
      },
    };

    const source = {
      config: {
        timeout: 5000,
      },
    };

    mergeInto(result, source);

    expect(result).toEqual({
      config: {
        debug: false,
        timeout: 5000,
      },
    });

    expect(source).toEqual({
      config: {
        timeout: 5000,
      },
    });
  });
});

describe("merge", () => {
  // existing tests...

  it("should not mutate any source", () => {
    const first = {
      config: {
        debug: false,
      },
    };

    const second = {
      config: {
        timeout: 5000,
      },
    };

    merge(first, second);

    expect(first).toEqual({
      config: {
        debug: false,
      },
    });

    expect(second).toEqual({
      config: {
        timeout: 5000,
      },
    });
  });
});
