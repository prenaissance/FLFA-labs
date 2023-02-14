import { expect } from "vitest";
import { it, describe } from "vitest";
import { createGrammar, Production } from "@/grammar";
import { createStringInput } from "@/parser/input";
import { LanguageParser } from "@/parser/language-parser";

const nonTerminal = ["a", "b", "c", "d", "e", "f"] as const;

const terminal = ["S", "R", "L"] as const;

type Lab1Vocabulary = (typeof nonTerminal)[number] | (typeof terminal)[number];
const productions: ReadonlyArray<Production<Lab1Vocabulary>> = [
  {
    from: "S",
    to: ["a", "S"],
  },
  {
    from: "S",
    to: ["b", "S"],
  },
  {
    from: "S",
    to: ["c", "R"],
  },
  {
    from: "R",
    to: ["d", "L"],
  },
  {
    from: "R",
    to: ["e"],
  },
  {
    from: "L",
    to: ["f", "L"],
  },
  {
    from: "L",
    to: ["e", "L"],
  },
  {
    from: "L",
    to: ["d"],
  },
];

const grammar = createGrammar("S", productions, terminal, nonTerminal);
const parser = new LanguageParser(grammar);

describe("lab1", () => {
  describe("parser", () => {
    it("should mark invalid sentences that do not start with starting productions", () => {
      const sentences = ["dse", "fed", "efa"];

      sentences.forEach((sentence) => {
        expect(
          parser.isValid(createStringInput<Lab1Vocabulary[]>(sentence)),
        ).toBe(false);
      });
    });

    it("should mark invalid sentences that have words outside the vocabulary", () => {
      const sentences = ["abcx", "alz", "abpr"];

      sentences.forEach((sentence) => {
        expect(
          parser.isValid(createStringInput<Lab1Vocabulary[]>(sentence)),
        ).toBe(false);
      });
    });

    it("should mark invalid sentences that do not reach the end of the automaton", () => {
      const sentences = ["abc", "abcde", "acd"];

      sentences.forEach((sentence) => {
        expect(
          parser.isValid(createStringInput<Lab1Vocabulary[]>(sentence)),
        ).toBe(false);
      });
    });

    it("should mark invalid sentences that do not end with a terminal", () => {
      const sentences = ["abS", "cR"];
      sentences.forEach((sentence) => {
        expect(
          parser.isValid(createStringInput<Lab1Vocabulary[]>(sentence)),
        ).toBe(false);
      });
    });

    it.each(["abce", "abcdfd", "cdd"])(
      "should validate %s as a valid sentence",
      (sentence) => {
        expect(
          parser.isValid(createStringInput<Lab1Vocabulary[]>(sentence)),
        ).toBe(true);
      },
    );
  });
});
