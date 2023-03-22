import { describe, it, expect } from "vitest";
import * as P from "@/parser";
import * as E from "fp-ts/Either";
import { bool, number, str } from "@/json-parser/sub-parsers";

describe("json parser", () => {
  it.each(["0.123", "14", "12e-3", "13.2e9", "0"])(
    `should parse number %s`,
    (input) => {
      const result = P.run(input)(number);

      expect(E.isRight(result)).toBe(true);
      expect(result._tag === "Right" && result.right.value).toBe(Number(input));
    },
  );

  it.each(["00", ".1", "1.", "2e"])(
    `should fail to parse number %s`,
    (input) => {
      const result = P.run(input)(number);

      const pointer =
        (result._tag === "Left" && result.left.input.index) ||
        (result._tag === "Right" && result.right.nextInput.index) ||
        0;

      expect(pointer).not.toBe(input.length);
    },
  );

  it("should parse string", () => {
    const input = '"hello world"';
    const result1 = P.run(input)(str);

    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toBe("hello world");

    const result2 = P.run('"broken string')(str);
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
    const result = P.run(input)(bool);

    expect(E.isRight(result)).toBe(success);
  });
});
