import {
  areArraysEqual,
  combinationsWithout,
  getCombinations,
} from "@/grammar/utilities";
import { describe, it, expect } from "vitest";

describe("lab4 utilities", () => {
  it("should compare arrays as value objects", () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    const c = [1, 2, 4];
    const d = [1, 2, 3, 4];

    expect(areArraysEqual(a, b)).toBe(true);
    expect(areArraysEqual(a, a)).toBe(true);
    expect(areArraysEqual(a, c)).toBe(false);
    expect(areArraysEqual(a, d)).toBe(false);
  });

  it("should get combinations from an array", () => {
    const a = [1, 2, 3];
    const b = [[1, 2, 3], [2, 3], [3], [], [2], [1, 3], [1], [1, 2]];

    expect(getCombinations(a)).toEqual(b);
  });

  it("should get combinations of an array without a specified element", () => {
    const combinationsWithoutB = combinationsWithout("b");
    const arr = ["a", "b", "c", "b"];
    const expected = [
      ["a", "c"],
      ["a", "b", "c"],
      ["a", "b", "c", "b"],
      ["a", "c", "b"],
    ];

    const combinationsWithoutA = combinationsWithout("A");
    const arr2 = ["b", "A"];
    const expected2 = [["b"], ["b", "A"]];
    expect(combinationsWithoutA(arr2)).toEqual(expected2);

    expect(combinationsWithoutB(arr)).toEqual(expected);
  });

  it("should not duplicate combinations of an array without a specified element", () => {
    const combinationsWithoutB = combinationsWithout("b");
    const arr = ["a", "b", "b", "c"];
    const expected = [
      ["a", "c"],
      ["a", "b", "c"],
      ["a", "b", "b", "c"],
    ];

    expect(combinationsWithoutB(arr)).toEqual(expected);
  });
});
