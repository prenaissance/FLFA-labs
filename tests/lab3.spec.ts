import { describe, it, expect } from "vitest";
import * as P from "@/parser";
import * as E from "fp-ts/Either";
import { number } from "@/json-parser/sub-parsers";

describe("json parser", () => {
  it.each(["0.123", "14", "12e-3", "13.2e9", "0"])(
    `should parse number %s`,
    (input) => {
      const result = P.run(input)(number);

      expect(E.isRight(result)).toBe(true);
      expect(result._tag === "Right" && result.right.value).toBe(Number(input));
    },
  );
});
