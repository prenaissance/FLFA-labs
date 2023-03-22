import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import * as P from "@/parser";

describe("lab3 -> combinators", () => {
  it("should accept either input for `alt`", () => {
    const parser = P.alt(P.char("a"))(P.char("b"));

    const result1 = P.run("abc")(parser);
    expect(E.isRight(result1)).toBe(true);
    const result2 = P.run("bcd")(parser);
    expect(E.isRight(result2)).toBe(true);
    const result3 = P.run("cde")(parser);
    expect(E.isLeft(result3)).toBe(true);
  });

  it("should prioritize non-alt parser for `alt`", () => {
    const parser = P.alt(P.char("a"))(P.str("ab"));

    const result1 = P.run("abc")(parser);
    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toBe("ab");
  });

  it("should accept any input for `oneOf`", () => {
    const oneParser = P.map((c: string) => Number(c))(P.char("1"));
    const parser = P.oneOf(P.char("a"), P.char("b"), oneParser);

    const result1 = P.run("abc")(parser);
    expect(E.isRight(result1)).toBe(true);
    const result2 = P.run("bcd")(parser);
    expect(E.isRight(result2)).toBe(true);
    const result3 = P.run("cde")(parser);
    expect(E.isLeft(result3)).toBe(true);
    expect(result3._tag === "Left" && result3.left.input).toEqual({
      text: "cde",
      index: 0,
    });
    const result4 = P.run("1de")(parser);
    expect(E.isRight(result4)).toBe(true);
  });

  it("should accept sequence of inputs for `sequence`", () => {
    const catParser = P.sequence(P.char("c"), P.char("a"), P.char("t"));

    const result1 = P.run("cat")(catParser);
    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toEqual([
      "c",
      "a",
      "t",
    ]);
    const result2 = P.run("dog")(catParser);
    expect(E.isLeft(result2)).toBe(true);
    const result3 = P.run("ca")(catParser);
    expect(E.isLeft(result3)).toBe(true);
    expect(result3._tag === "Left" && result3.left.input).toEqual({
      text: "ca",
      index: 0,
    });
  });

  it("should parse correctly `between` parsers", () => {
    const parser = P.between(P.char("["), P.char("]"))(P.char("a"));
    const result1 = P.run("[a]")(parser);
    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toBe("a");
    const result2 = P.run("[b]")(parser);
    expect(E.isLeft(result2)).toBe(true);
  });

  it("should parse correctly `many` parsers", () => {
    const parser = P.many(P.char("a"));
    const result1 = P.run("aaa")(parser);
    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toEqual([
      "a",
      "a",
      "a",
    ]);

    const result2 = P.run("bbb")(parser);
    expect(E.isRight(result2)).toBe(true);
    expect(result2._tag === "Right" && result2.right.value).toEqual([]);

    const result3 = P.run("aab")(parser);
    expect(E.isRight(result3)).toBe(true);
    expect(result3._tag === "Right" && result3.right.value).toEqual(["a", "a"]);
  });

  it("should parse correctly `many1` parsers", () => {
    const parser = P.many1(P.char("a"));
    const result1 = P.run("aaa")(parser);
    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toEqual([
      "a",
      "a",
      "a",
    ]);
    expect(result1._tag === "Right" && result1.right.nextInput).toEqual({
      text: "aaa",
      index: 3,
    });

    const result2 = P.run("bbb")(parser);
    expect(E.isLeft(result2)).toBe(true);
    expect(result2._tag === "Left" && result2.left.input).toEqual({
      text: "bbb",
      index: 0,
    });
  });

  it("should parse correctly `sepBy` parsers", () => {
    const parser = P.sepBy(P.between(P.whitespace, P.whitespace)(P.char(",")))(
      P.char("a"),
    );
    const result1 = P.run("a, a , a,a")(parser);
    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toEqual([
      "a",
      "a",
      "a",
      "a",
    ]);

    const result2 = P.run("")(parser);
    expect(E.isRight(result2)).toBe(true);
  });

  it("should parse correctly `sepBy1` parsers", () => {
    const parser = P.sepBy1(P.between(P.whitespace, P.whitespace)(P.char(",")))(
      P.char("a"),
    );
    const result1 = P.run("a,  a")(parser);
    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toEqual(["a", "a"]);

    const result2 = P.run("")(parser);
    expect(E.isLeft(result2)).toBe(true);
  });

  it("should any character except the `except` parser", () => {
    const parser = P.except(P.char("a"))(P.alpha);
    const result1 = P.run("a")(parser);
    expect(E.isLeft(result1)).toBe(true);
    const result2 = P.run("b")(parser);
    expect(E.isRight(result2)).toBe(true);
  });

  it("should parse every character until the `except` parser", () => {
    const parser = P.many(P.except(P.char("a"))(P.alpha));
    const result1 = P.run("bba")(parser);
    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toEqual(["b", "b"]);

    const result2 = P.run("a")(parser);
    expect(E.isRight(result2)).toBe(true);
    expect(result2._tag === "Right" && result2.right.value).toEqual([]);
  });
});
