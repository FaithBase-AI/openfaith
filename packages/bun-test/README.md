# Introduction

Welcome to your guide on testing Effect-based applications using `bun test` and the `@openfaith/bun-test` package. This package simplifies running tests for Effect-based code with Bun's built-in test runner.

In this guide, we'll walk you through setting up the necessary dependencies and provide examples of how to write Effect-based tests using `@openfaith/bun-test`.

# Requirements

First, ensure you have [Bun](https://bun.sh/) installed (version `1.0.0` or later).

```sh
curl -fsSL https://bun.sh/install | bash
```

Next, install the `@openfaith/bun-test` package, which integrates Effect with Bun's test runner.

```sh
bun add -D @openfaith/bun-test
```

# Overview

The main entry point is the following import:

```ts
import {
  effect,
  live,
  scoped,
  scopedLive,
  flakyTest,
  layer,
} from "@openfaith/bun-test";
```

This package provides several powerful testing utilities for Effect-based code:

| Feature      | Description                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `effect`     | Automatically injects a `TestContext` (e.g., `TestClock`) when running a test.                         |
| `live`       | Runs the test with the live Effect environment.                                                        |
| `scoped`     | Allows running an Effect program that requires a `Scope`.                                              |
| `scopedLive` | Combines the features of `scoped` and `live`, using a live Effect environment that requires a `Scope`. |
| `flakyTest`  | Facilitates the execution of tests that might occasionally fail.                                       |
| `layer`      | Share Effect layers between multiple tests with automatic setup and teardown.                          |

# Writing Tests with `effect`

Here's how to use `effect` to write your tests:

**Syntax**

```ts
import { effect } from "@openfaith/bun-test"

effect("test name", () => EffectContainingAssertions, timeout?: number | { timeout?: number })
```

`effect` automatically provides a `TestContext`, allowing access to services like [`TestClock`](#using-the-testclock).

## Testing Successful Operations

To write a test, place your assertions directly within the main effect. This ensures that your assertions are evaluated as part of the test's execution.

**Example** (Testing a Successful Operation)

In the following example, we test a function that divides two numbers, but fails if the divisor is zero. The goal is to check that the function returns the correct result when given valid input.

```ts
import { effect } from "@openfaith/bun-test";
import { expect } from "bun:test";
import { Effect } from "effect";

// A simple divide function that returns an Effect, failing when dividing by zero
function divide(a: number, b: number) {
  if (b === 0) return Effect.fail("Cannot divide by zero");
  return Effect.succeed(a / b);
}

// Testing a successful division
effect("test success", () =>
  Effect.gen(function* () {
    const result = yield* divide(4, 2); // Expect 4 divided by 2 to succeed
    expect(result).toBe(2); // Assert that the result is 2
  }),
);
```

## Testing Successes and Failures as `Exit`

When you need to handle both success and failure cases in a test, you can use `Effect.exit` to capture the outcome as an `Exit` object. This allows you to verify both successful and failed results within the same test structure.

**Example** (Testing Success and Failure with `Exit`)

```ts
import { effect } from "@openfaith/bun-test";
import { expect } from "bun:test";
import { Effect, Exit } from "effect";

// A function that divides two numbers and returns an Effect.
// It fails if the divisor is zero.
function divide(a: number, b: number) {
  if (b === 0) return Effect.fail("Cannot divide by zero");
  return Effect.succeed(a / b);
}

// Test case for a successful division, using `Effect.exit` to capture the result
effect("test success as Exit", () =>
  Effect.gen(function* () {
    const result = yield* Effect.exit(divide(4, 2)); // Capture the result as an Exit
    expect(result).toStrictEqual(Exit.succeed(2)); // Expect success with the value 2
  }),
);

// Test case for a failure (division by zero), using `Effect.exit`
effect("test failure as Exit", () =>
  Effect.gen(function* () {
    const result = yield* Effect.exit(divide(4, 0)); // Capture the result as an Exit
    expect(result).toStrictEqual(Exit.fail("Cannot divide by zero")); // Expect failure with the correct message
  }),
);
```

## Using the TestClock

When writing tests with `effect`, a `TestContext` is automatically provided. This context gives access to various testing services, including the [`TestClock`](https://effect.website/docs/guides/testing/testclock), which allows you to simulate the passage of time in your tests.

**Note**: If you want to use the real-time clock (instead of the simulated one), you can switch to `live`.

**Example** (Using `TestClock` and `live`)

Here are examples that demonstrate how you can work with time in your tests using `effect` and `TestClock`:

1. **Using `live` to show the current time**: This will display the actual system time, since it runs in the live environment.
2. **Using `effect` without adjustments**: By default, the `TestClock` starts at `0`, simulating the beginning of time for your test without any time passing.
3. **Using `effect` and adjusting time**: In this test, we simulate the passage of time by advancing the clock by 1000 milliseconds (1 second).

```ts
import { effect, live } from "@openfaith/bun-test";
import { Clock, Effect, TestClock } from "effect";

// Effect to log the current time
const logNow = Effect.gen(function* () {
  const now = yield* Clock.currentTimeMillis; // Fetch the current time from the clock
  console.log(now); // Log the current time
});

// Example of using the real system clock with `live`
live("runs the test with the live Effect environment", () =>
  Effect.gen(function* () {
    yield* logNow; // Prints the actual current time
  }),
);

// Example of using `effect` with the default test environment
effect("run the test with the test environment", () =>
  Effect.gen(function* () {
    yield* logNow; // Prints 0, as the test clock starts at 0
  }),
);

// Example of advancing the test clock by 1000 milliseconds
effect("run the test with the test environment and the time adjusted", () =>
  Effect.gen(function* () {
    yield* TestClock.adjust("1000 millis"); // Move the clock forward by 1000 milliseconds
    yield* logNow; // Prints 1000, reflecting the adjusted time
  }),
);
```

## Skipping Tests

If you need to temporarily disable a test but don't want to delete or comment out the code, you can use `effect.skip`. This is helpful when you're working on other parts of your test suite but want to keep the test for future execution.

**Example** (Skipping a Test)

```ts
import { effect } from "@openfaith/bun-test";
import { expect } from "bun:test";
import { Effect, Exit } from "effect";

function divide(a: number, b: number) {
  if (b === 0) return Effect.fail("Cannot divide by zero");
  return Effect.succeed(a / b);
}

// Temporarily skip the test for dividing numbers
effect.skip("test failure as Exit", () =>
  Effect.gen(function* () {
    const result = yield* Effect.exit(divide(4, 0));
    expect(result).toStrictEqual(Exit.fail("Cannot divide by zero"));
  }),
);
```

## Running a Single Test

When you're developing or debugging, it's often useful to run a specific test without executing the entire test suite. You can achieve this by using `effect.only`, which will run just the selected test and ignore the others.

**Example** (Running a Single Test)

```ts
import { effect } from "@openfaith/bun-test";
import { expect } from "bun:test";
import { Effect, Exit } from "effect";

function divide(a: number, b: number) {
  if (b === 0) return Effect.fail("Cannot divide by zero");
  return Effect.succeed(a / b);
}

// Run only this test, skipping all others
effect.only("test failure as Exit", () =>
  Effect.gen(function* () {
    const result = yield* Effect.exit(divide(4, 0));
    expect(result).toStrictEqual(Exit.fail("Cannot divide by zero"));
  }),
);
```

## Expecting Tests to Fail

When adding new failing tests, you might not be able to fix them right away. Instead of skipping them, you may want to assert it fails, so that when you fix them, you'll know and can re-enable them before it regresses.

**Example** (Asserting one test fails)

```ts
import { effect } from "@openfaith/bun-test";
import { Effect, Exit } from "effect";

function divide(a: number, b: number) {
  if (b === 0) return Effect.fail("Cannot divide by zero");
  return Effect.succeed(a / b);
}

// Temporarily assert that the test for dividing by zero fails.
effect.fails("dividing by zero special cases", () =>
  Effect.gen(function* () {
    const result = yield* Effect.exit(divide(4, 0));
    expect(result).toStrictEqual(0);
  }),
);
```

## Logging

By default, `effect` suppresses log output, which can be useful for keeping test results clean. However, if you want to enable logging during tests, you can use `live` or provide a custom logger to control the output.

**Example** (Controlling Logging in Tests)

```ts
import { effect, live } from "@openfaith/bun-test";
import { Effect, Logger } from "effect";

// This test won't display the log message, as logging is suppressed by default in `effect`
effect("does not display a log", () =>
  Effect.gen(function* () {
    yield* Effect.log("effect"); // Log won't be shown
  }),
);

// This test will display the log because a custom logger is provided
effect("providing a logger displays a log", () =>
  Effect.gen(function* () {
    yield* Effect.log("effect with custom logger"); // Log will be displayed
  }).pipe(
    Effect.provide(Logger.pretty), // Providing a pretty logger for log output
  ),
);

// This test runs using `live`, which enables logging by default
live("live displays a log", () =>
  Effect.gen(function* () {
    yield* Effect.log("live"); // Log will be displayed
  }),
);
```

# Writing Tests with `scoped`

The `scoped` method is used for tests that involve `Effect` programs needing a `Scope`. A `Scope` ensures that any resources your test acquires are managed properly, meaning they will be released when the test completes. This helps prevent resource leaks and guarantees test isolation.

**Example** (Using `scoped` to Manage Resource Lifecycle)

```ts
import { effect, scoped } from "@openfaith/bun-test";
import { Console, Effect } from "effect";

// Simulating the acquisition and release of a resource with console logging
const acquire = Console.log("acquire resource");
const release = Console.log("release resource");

// Defining a resource that requires proper management
const resource = Effect.acquireRelease(acquire, () => release);

// Incorrect usage: This will result in a type error because it lacks a scope
effect("run with scope", () =>
  Effect.gen(function* () {
    yield* resource;
  }),
);

// Correct usage: Using 'scoped' to manage the scope correctly
scoped("run with scope", () =>
  Effect.gen(function* () {
    yield* resource;
  }),
);
```

# Writing Tests with `layer`

The `layer` function allows you to share Effect layers between multiple tests, providing automatic setup and teardown. This is particularly useful when you have services or dependencies that need to be initialized once and shared across multiple test cases.

**Example** (Using `layer` to Share Services)

```ts
import { layer } from "@openfaith/bun-test";
import { expect } from "bun:test";
import { Context, Effect, Layer } from "effect";

// Define a service
class DatabaseService extends Context.Tag("DatabaseService")<
  DatabaseService,
  {
    query: (sql: string) => Effect.Effect<any[]>;
  }
>() {
  static Live = Layer.succeed(DatabaseService, {
    query: (sql: string) => Effect.succeed([{ id: 1, name: "test" }]),
  });
}

// Share the database service across multiple tests
layer(DatabaseService.Live)("database tests", (it) => {
  it.effect("should query users", () =>
    Effect.gen(function* () {
      const db = yield* DatabaseService;
      const users = yield* db.query("SELECT * FROM users");
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual({ id: 1, name: "test" });
    }),
  );

  it.effect("should handle multiple queries", () =>
    Effect.gen(function* () {
      const db = yield* DatabaseService;
      const users = yield* db.query("SELECT * FROM users");
      const posts = yield* db.query("SELECT * FROM posts");
      expect(users).toBeDefined();
      expect(posts).toBeDefined();
    }),
  );

  // You can also use live tests within layers
  it.live("should work with live environment", () =>
    Effect.gen(function* () {
      const result = yield* Effect.succeed("live test in layer");
      expect(result).toBe("live test in layer");
    }),
  );
});
```

**Example** (Nested Layers)

```ts
import { layer } from "@openfaith/bun-test";
import { Context, Effect, Layer } from "effect";

class AuthService extends Context.Tag("AuthService")<
  AuthService,
  {
    authenticate: (token: string) => Effect.Effect<boolean>;
  }
>() {
  static Live = Layer.succeed(AuthService, {
    authenticate: (token: string) => Effect.succeed(token === "valid"),
  });
}

// Nested layers for complex test scenarios
layer(DatabaseService.Live)("with database", (it) => {
  it.layer(AuthService.Live)("with auth", (it) => {
    it.effect("should have both services", () =>
      Effect.gen(function* () {
        const db = yield* DatabaseService;
        const auth = yield* AuthService;

        const users = yield* db.query("SELECT * FROM users");
        const isAuthenticated = yield* auth.authenticate("valid");

        expect(users).toBeDefined();
        expect(isAuthenticated).toBe(true);
      }),
    );
  });
});
```

# Writing Tests with `flakyTest`

`flakyTest` is a utility designed to manage tests that may not succeed consistently on the first attempt. These tests, often referred to as "flaky," can fail due to factors like timing issues, external dependencies, or randomness. `flakyTest` allows for retrying these tests until they pass or a specified timeout is reached.

**Example** (Handling Flaky Tests with Retries)

Let's start by setting up a basic test scenario that has the potential to fail randomly:

```ts
import { effect, flakyTest } from "@openfaith/bun-test";
import { Effect, Random } from "effect";

// Simulating a flaky effect
const flaky = Effect.gen(function* () {
  const random = yield* Random.nextBoolean;
  if (random) {
    return yield* Effect.fail("Failed due to randomness");
  }
});

// Standard test that may fail intermittently
effect("possibly failing test", () => flaky);
```

In this test, the outcome is random, so the test might fail depending on the result of `Random.nextBoolean`.

To handle this flakiness, we use `flakyTest` to retry the test until it passes, or until a defined timeout expires:

```ts
// Retrying the flaky test with a 5-second timeout
effect("retrying until success or timeout", () =>
  flakyTest(flaky, "5 seconds"),
);
```

# Effect-aware Assertions

The package also provides assertions that work well with Effect data types:

```ts
import {
  assertEquals,
  assertSuccess,
  assertFailure,
  assertSome,
  assertNone,
  assertRight,
  assertLeft,
} from "@openfaith/bun-test/assert";
import { Effect, Exit, Option, Either } from "effect";

effect("should work with Effect assertions", () =>
  Effect.gen(function* () {
    // Exit assertions
    const result = yield* Effect.exit(Effect.succeed(42));
    assertSuccess(result, 42);

    // Option assertions
    assertSome(Option.some(42), 42);
    assertNone(Option.none());

    // Either assertions
    assertRight(Either.right(42), 42);
    assertLeft(Either.left("error"), "error");

    // Equal.equals support
    assertEquals(someComplexObject, expectedObject);
  }),
);
```

# Comparison with @effect/vitest

This package provides similar functionality to `@effect/vitest` but is designed specifically for Bun's test runner:

- **Bun Native**: Uses Bun's built-in test runner instead of Vitest
- **Simplified API**: Focuses on core testing patterns
- **Effect-first**: Built specifically for Effect-TS applications
- **Lightweight**: Minimal dependencies and overhead

# Contributing

This package is part of the OpenFaith project. Contributions are welcome!

# License

MIT
