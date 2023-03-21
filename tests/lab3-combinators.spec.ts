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

  it("should accept any input for `oneOf`", () => {
    const oneParser = P.map((c: string) => Number(c))(P.char("1"));
    const parser = P.oneOf(P.char("a"), P.char("b"), oneParser);

    const result1 = P.run("abc")(parser);
    expect(E.isRight(result1)).toBe(true);
    const result2 = P.run("bcd")(parser);
    expect(E.isRight(result2)).toBe(true);
    const result3 = P.run("cde")(parser);
    expect(E.isLeft(result3)).toBe(true);
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
  });

  it("should parse correctly `between` parsers", () => {
    const parser = P.between(P.char("["), P.char("]"))(P.char("a"));
    const result1 = P.run("[a]")(parser);
    expect(E.isRight(result1)).toBe(true);
    expect(result1._tag === "Right" && result1.right.value).toBe("a");
    const result2 = P.run("[b]")(parser);
    expect(E.isLeft(result2)).toBe(true);
  });
});
