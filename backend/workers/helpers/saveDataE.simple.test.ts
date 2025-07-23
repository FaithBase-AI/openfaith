import { effect } from "@openfaith/bun-test";
import { expect } from "bun:test";
import { Effect } from "effect";

// Very simple test without containers
effect("simple test without containers", () =>
  Effect.gen(function* () {
    const result = yield* Effect.succeed(42);
    expect(result).toBe(42);
  }),
);

effect("another simple test", () =>
  Effect.gen(function* () {
    const result = yield* Effect.succeed("hello");
    expect(result).toBe("hello");
  }),
);
