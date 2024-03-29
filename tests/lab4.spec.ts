import { describe, it, expect } from "vitest";

import { Grammar } from "@/grammar/grammar";
import { v2Grammar } from "@/fixtures/lab4-grammars";

describe("lab4", () => {
  it("should clone grammar", () => {
    const grammar = v2Grammar.clone();
    expect(grammar).toEqual(v2Grammar);
    expect(grammar).not.toBe(v2Grammar);
    grammar.terminal[0] = "c";

    expect(grammar).not.toEqual(v2Grammar);
  });

  it("should remove right hand starting symbol", () => {
    const grammar = v2Grammar.withoutRighthandStart();
    expect(grammar).not.toEqual(v2Grammar);
  });

  it("should not change starting symbol if it is not on the right hand side", () => {
    const grammar = new Grammar(
      "S",
      [
        { from: ["S"], to: ["a", "B"] },
        { from: ["S"], to: ["b", "A"] },
        { from: ["A"], to: ["a"] },
      ],
      ["S", "A", "B"],
      ["a", "b"],
    );

    const grammarWithoutRighthandStart = grammar.withoutRighthandStart();
    expect(grammarWithoutRighthandStart).toEqual(grammar);
  });

  it("should remove null productions", () => {
    const grammar = v2Grammar.withoutNullProductions();
    const expected = {
      start: "S",
      productions: [
        {
          from: ["S"],
          to: ["a", "B"],
        },
        {
          from: ["S"],
          to: ["b"],
        },
        {
          from: ["S"],
          to: ["b", "A"],
        },
        {
          from: ["A"],
          to: ["B"],
        },
        {
          from: ["A"],
          to: ["b"],
        },
        {
          from: ["A"],
          to: ["a", "D"],
        },
        {
          from: ["A"],
          to: ["S"],
        },
        {
          from: ["A"],
          to: ["A", "S"],
        },
        {
          from: ["A"],
          to: ["b", "B"],
        },
        {
          from: ["A"],
          to: ["b", "A", "B"],
        },
        {
          from: ["A"],
          to: ["b", "A", "A", "B"],
        },
        {
          from: ["B"],
          to: ["b"],
        },
        {
          from: ["B"],
          to: ["b", "S"],
        },
        {
          from: ["C"],
          to: ["B"],
        },
        {
          from: ["C"],
          to: ["A", "B"],
        },
        {
          from: ["D"],
          to: ["B", "B"],
        },
      ],
      nonTerminal: ["S", "A", "B", "C", "D"],
      terminal: ["a", "b"],
    };

    expect(grammar).toEqual(expected);
  });

  it("should not give combinations when null production doesn't have different outcome", () => {
    const grammar = new Grammar(
      "S",
      [
        { from: ["S"], to: ["a", "B"] },
        { from: ["B"], to: ["b"] },
        { from: ["S"], to: ["b", "A"] },
        { from: ["A"], to: [] },
      ],
      ["S", "A", "B"],
      ["a", "b"],
    );

    const grammarWithoutNullProductions = grammar.withoutNullProductions();

    const expected = new Grammar(
      "S",
      [
        { from: ["S"], to: ["a", "B"] },
        { from: ["B"], to: ["b"] },
        { from: ["S"], to: ["b"] },
      ],
      ["S", "B"],
      ["a", "b"],
    );

    expect(grammarWithoutNullProductions).toEqual(expected);
  });

  it("should remove unit productions", () => {
    const grammar = new Grammar(
      "S",
      [
        { from: ["S"], to: ["a", "B"] },
        { from: ["B"], to: ["b"] },
        { from: ["S"], to: ["b", "A"] },
        { from: ["A"], to: ["B"] },
      ],
      ["S", "A", "B"],
      ["a", "b"],
    );

    const grammarWithoutUnitProductions = grammar.withoutUnitProductions();

    const expected = new Grammar(
      "S",
      [
        { from: ["S"], to: ["a", "B"] },
        { from: ["B"], to: ["b"] },
        { from: ["S"], to: ["b", "A"] },
        { from: ["A"], to: ["b"] },
      ],
      ["S", "A", "B"],
      ["a", "b"],
    );

    expect(grammarWithoutUnitProductions).toEqual(expected);
  });

  it("should remove unreachable productions", () => {
    const grammar = new Grammar(
      "S",
      [
        { from: ["S"], to: ["a", "B"] },
        { from: ["C"], to: ["e", "D"] },
        { from: ["D"], to: ["f"] },
      ],
      ["S", "B", "C", "D"],
      ["a", "e", "f"],
    );

    const grammarWithoutUnreachableProductions =
      grammar.withoutUnreachableProductions();

    const expected = new Grammar(
      "S",
      [{ from: ["S"], to: ["a", "B"] }],
      ["S", "B"],
      ["a"],
    );

    expect(grammarWithoutUnreachableProductions).toEqual(expected);
  });

  it("should remove non generating productions", () => {
    const grammar = new Grammar(
      "S",
      [
        { from: ["S"], to: ["a", "B"] },
        { from: ["B"], to: ["e", "D"] },
        { from: ["B"], to: ["f"] },
      ],
      ["S", "B", "C", "D"],
      ["a", "e", "f"],
    );

    const grammarWithoutNonGeneratingProductions =
      grammar.withoutNonGeneratingProductions();

    const expected = new Grammar(
      "S",
      [
        { from: ["S"], to: ["a", "B"] },
        { from: ["B"], to: ["f"] },
      ],
      ["B", "S"],
      ["a", "f"],
    );

    expect(grammarWithoutNonGeneratingProductions).toEqual(expected);
  });

  it("should simplify productions with longer than 2 right hand side", () => {
    const grammar = new Grammar(
      "S",
      [
        { from: ["S"], to: ["A", "S", "A"] },
        { from: ["A"], to: ["a"] },
        { from: ["A"], to: ["A", "S", "A"] },
      ],
      ["S", "A"],
      ["a"],
    );

    const grammarWithoutLongProductions = grammar.withoutLongProductions();

    const expected = new Grammar(
      "S",
      [
        { from: ["B"], to: ["S", "A"] },
        { from: ["S"], to: ["A", "B"] },
        { from: ["A"], to: ["a"] },
        { from: ["A"], to: ["A", "B"] },
      ],
      ["S", "A", "B"],
      ["a"],
    );

    expect(grammarWithoutLongProductions).toEqual(expected);
  });

  it("should remove chain productions", () => {
    const grammar = new Grammar(
      "S",
      [
        { from: ["S"], to: ["A", "B"] },
        { from: ["A"], to: ["a", "B"] },
        { from: ["B"], to: ["A", "b"] },
        { from: ["B"], to: ["b"] },
      ],
      ["S", "A", "B"],
      ["a", "b"],
    );

    const grammarWithoutChainProductions = grammar.withoutChainProductions();

    const expected = new Grammar(
      "S",
      [
        { from: ["S"], to: ["A", "B"] },
        { from: ["A"], to: ["C", "B"] },
        { from: ["B"], to: ["A", "D"] },
        { from: ["B"], to: ["b"] },
        { from: ["C"], to: ["a"] },
        { from: ["D"], to: ["b"] },
      ],
      ["S", "A", "B", "C", "D"],
      ["a", "b"],
    );

    expect(grammarWithoutChainProductions).toEqual(expected);
  });
});
