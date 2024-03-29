import { describe, it, expect } from "vitest";
import * as P from "@/parser";
import * as E from "fp-ts/Either";
import {
  arrayString,
  arrayTokens,
  objectString,
  objectTokens,
  kitchenSinkString,
  kitchenSinkTokens,
} from "@/fixtures/lab3-tokens";
import {
  array,
  bool,
  json,
  number,
  object,
  str,
} from "@/json-parser/sub-parsers";

import { lex } from "@/json-parser/lexer";

describe("json parser", () => {
  it.each(["0.123", "-14", "12e-3", "13.2e+9", "0"])(
    `should parse number %s`,
    (input) => {
      const result = P.runSafe(input)(number);

      expect(E.isRight(result)).toBe(true);
      expect(result._tag === "Right" && result.right.value).toBe(Number(input));
    },
  );

  it.each(["00", ".1", "1.", "2e", "01.12"])(
    `should fail to parse number %s`,
    (input) => {
      const result = P.runSafe(input)(number);

      const pointer =
        (result._tag === "Left" && result.left.input.index) ||
        (result._tag === "Right" && result.right.nextInput.index) ||
        0;

      expect(pointer).not.toBe(input.length);
    },
  );

  it("should parse string", () => {
    const input = '"hello world"';
    const result1 = P.runSafe(input)(str);

    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toBe("hello world");

    const result2 = P.runSafe('"broken string')(str);
    expect(E.isLeft(result2)).toBe(true);
  });

  it.each([
    {
      input: "true",
      success: true,
    },
    {
      input: "false",
      success: true,
    },
    {
      input: "null",
      success: false,
    },
  ])("should parse booleans", ({ input, success }) => {
    const result = P.runSafe(input)(bool);

    expect(E.isRight(result)).toBe(success);
  });

  it("should parse arrays of primitives", () => {
    const input = '[1, "hello", true]';
    const result = P.runSafe(input)(array);

    expect(E.isRight(result)).toBe(true);
    expect(result._tag === "Right" && result.right.value).toEqual([
      1,
      "hello",
      true,
    ]);
  });

  it("should parse arrays with nested arrays", () => {
    const input = '[1, "hello", [true, false]]';
    const result = P.runSafe(input)(array);

    expect(E.isRight(result)).toBe(true);
    expect(result._tag === "Right" && result.right.value).toEqual([
      1,
      "hello",
      [true, false],
    ]);
  });

  it("should parse objects with primitive values", () => {
    const input = '{"a": 1, "b": "hello", "c": true}';
    const result = P.runSafe(input)(object);

    expect(E.isRight(result)).toBe(true);
    expect(result._tag === "Right" && result.right.value).toEqual({
      a: 1,
      b: "hello",
      c: true,
    });
  });

  it("should parse objects with nested objects", () => {
    const input = '{"a": 1, "b": "hello", "c": {"d": true}}';
    const result = P.runSafe(input)(object);

    expect(E.isRight(result)).toBe(true);
    expect(result._tag === "Right" && result.right.value).toEqual({
      a: 1,
      b: "hello",
      c: { d: true },
    });
  });

  it("should parse objects with array keys", () => {
    const input = '{"a": 1, "b": "hello", "c": {"d": true}, "e": [1, 2, 3]}';
    const result = P.runSafe(input)(object);

    expect(E.isRight(result)).toBe(true);
    expect(result._tag === "Right" && result.right.value).toEqual({
      a: 1,
      b: "hello",
      c: { d: true },
      e: [1, 2, 3],
    });
  });

  it.each([
    "asdf",
    null,
    1234.213,
    -23.1,
    [1, 2, { a: 1, b: "14" }],
    { a: 1, b: 2 },
    { a: 1, b: 2, c: [null, "12", 3] },
  ])("should parse %s as a valid json", (input) => {
    const result = P.runSafe(JSON.stringify(input))(json);
    expect(E.isRight(result)).toBe(true);
    expect(result._tag === "Right" && result.right.value).toEqual(input);
  });

  it.each([
    {
      input: arrayString,
      expected: arrayTokens,
    },
    {
      input: objectString,
      expected: objectTokens,
    },
    {
      input: kitchenSinkString,
      expected: kitchenSinkTokens,
    },
  ])("should lex json", ({ input, expected }) => {
    const result = P.runSafe(input)(lex);

    expect(E.isRight(result)).toBe(true);
    expect(result._tag === "Right" && result.right.value).toEqual(expected);
  });
});
