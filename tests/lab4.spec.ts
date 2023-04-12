import { Grammar, Production } from "@/grammar/grammar";
import { describe, it, expect } from "vitest";

const v2Start = "S";
const v2NonTerminals = ["S", "A", "B", "C", "D"];
const v2Terminals = ["a", "b"];
const v2Productions: Production[] = [
  { from: ["S"], to: ["a", "B"] },
  { from: ["S"], to: ["b", "A"] },
  { from: ["A"], to: ["B"] },
  { from: ["A"], to: ["b"] },
  { from: ["A"], to: ["a", "D"] },
  { from: ["A"], to: ["A", "S"] },
  { from: ["A"], to: ["b", "A", "A", "B"] },
  { from: ["A"], to: [] },
  { from: ["B"], to: ["b"] },
  { from: ["B"], to: ["b", "S"] },
  { from: ["C"], to: ["A", "B"] },
  { from: ["D"], to: ["B", "B"] },
];

const v2Grammar = new Grammar(
  v2Start,
  v2Productions,
  v2NonTerminals,
  v2Terminals,
);

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
});
