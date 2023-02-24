import { expect } from "vitest";
import { it, describe } from "vitest";
import { createGrammar } from "@/grammar";
import { createInput, createStringInput } from "@/parser/input";
import { LanguageParser } from "@/parser/language-parser";
import {
  Lab1Vocabulary,
  nonTerminal,
  productions,
  terminal,
} from "fixtures/lab1-grammar";

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

  describe("generation", () => {
    it("should generate sentences that pass validation", () => {
      const sentences = new Array(100)
        .fill(null)
        .map(() => parser.generateSentence());

      sentences.forEach((sentence) => {
        expect(parser.isValid(createInput<Lab1Vocabulary[]>(sentence))).toBe(
          true,
        );
      });
    });

    it("should throw when completing a sentence with a start word outside the vocabulary", () => {
      const input = ["x"];
      expect(() =>
        parser.generateSentence(input as Lab1Vocabulary[]),
      ).toThrow();
    });
  });
});
