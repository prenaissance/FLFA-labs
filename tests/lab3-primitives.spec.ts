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

  it("should fail on unexpected characters", () => {
    const parser = P.char("a");
    const result = P.run("bcd")(parser);
    expect(result._tag === "Left" && result.left.input).toEqual({
      text: "bcd",
      index: 0,
    });
  });

  it("should fail on end of input", () => {
    const parser = P.char("a");
    const result = P.run("")(parser);
    expect(result._tag === "Left" && result.left.input).toEqual({
      text: "",
      index: 0,
    });
  });
});
