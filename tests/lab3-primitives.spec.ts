import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import * as P from "@/parser";

describe("lab3 -> primitives", () => {
  it("should parse single characters", () => {
    const parser = P.char("a");
    const result = P.run("abc")(parser);
    expect(result._tag === "Right" && result.right.value).toBe("a");
    expect(result._tag === "Right" && result.right.nextInput).toEqual({
      text: "abc",
      index: 1,
    });
  });

  it("should fail char on unexpected characters", () => {
    const parser = P.char("a");
    const result = P.run("bcd")(parser);
    expect(result._tag === "Left" && result.left.input).toEqual({
      text: "bcd",
      index: 0,
    });
  });

  it("should fail char on end of input", () => {
    const parser = P.char("a");
    const result = P.run("")(parser);
    expect(result._tag === "Left" && result.left.input).toEqual({
      text: "",
      index: 0,
    });
  });

  it("should parse digits", () => {
    const parser = P.digit;
    const result = P.run("123")(parser);
    expect(result._tag === "Right" && result.right.value).toBe("1");
    expect(result._tag === "Right" && result.right.nextInput).toEqual({
      text: "123",
      index: 1,
    });
  });

  it.each([
    [" ", true],
    ["\t", true],
    ["\r", true],
    ["\n", true],
    ["b", false],
    ["", false],
  ])("should parse whitespace", (input, expected) => {
    const parser = P.empty;
    const result = P.run(input)(parser);
    expect(E.isRight(result)).toBe(expected);
  });

  it("should parse strings", () => {
    const parser = P.str("cat");

    const result = P.run("cat")(parser);
    expect(result._tag === "Right" && result.right.value).toBe("cat");
    expect(result._tag === "Right" && result.right.nextInput).toEqual({
      text: "cat",
      index: 3,
    });

    const result2 = P.run("cad")(parser);
    expect(result2._tag === "Left" && result2.left.input).toEqual({
      text: "cad",
      index: 0,
    });
  });

  it("should parse leading whitespace", () => {
    const parser = P.map<[any, string], string>(([_, cat]) => cat)(
      P.sequence(P.whitespace, P.str("cat")),
    );

    const result = P.run("  \ncat")(parser);
    expect(result._tag === "Right" && result.right.value).toBe("cat");
  });
});
