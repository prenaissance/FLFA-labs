import { describe, it, expect } from "vitest";
import { Automaton } from "@/state-machine/automaton";
import {
  finalStates,
  initialState,
  states,
  transitions,
} from "fixtures/lab2-state-machine";
import { Grammar } from "@/grammar/grammar";

const automaton = new Automaton(initialState, states, transitions, finalStates);

describe("lab2", () => {
  describe("automaton", () => {
    it("should convert to grammar", () => {
      const grammar = automaton.toGrammar();
      expect(grammar).toEqual({
        start: "q0",
        productions: [
          { from: "q0", to: ["a", "q1"] },
          { from: "q1", to: ["b", "q1"] },
          { from: "q1", to: ["a", "q2"] },
          { from: "q2", to: ["b", "q2"] },
          { from: "q2", to: ["b", "q3"] },
          { from: "q3", to: ["b"] },
          { from: "q3", to: ["a", "q1"] },
        ],
        nonTerminal: states,
        terminal: ["a", "b"],
      });
    });

    it("should determine if automaton is not deterministic", () => {
      expect(automaton.isDeterministic()).toBe(false);
    });

    it("should determine if automaton is deterministic", () => {
      const deterministicAutomaton = new Automaton(
        "q1",
        ["q1", "q2", "q3"],
        [
          { from: "q1", to: "q2", effect: "a" },
          { from: "q2", to: "q2", effect: "b" },
          { from: "q2", to: "q3", effect: "a" },
        ],
        ["q3"],
      );
      expect(deterministicAutomaton.isDeterministic()).toBe(true);
    });

    it("should convert to deterministic automaton", () => {
      const deterministicAutomaton = automaton.toDeterministic();
      expect(deterministicAutomaton).toEqual(
        new Automaton(
          "q0",
          ["q0", "q1", "q2", "{q2,q3}", "{q2,q3,q4}"],
          [
            { from: "q0", to: "q1", effect: "a" },
            { from: "q1", to: "q2", effect: "a" },
            { from: "q1", to: "q1", effect: "b" },
            { from: "q2", to: "{q2,q3}", effect: "b" },
            { from: "{q2,q3}", to: "q1", effect: "a" },
            { from: "{q2,q3}", to: "{q2,q3,q4}", effect: "b" },
            { from: "{q2,q3,q4}", to: "q1", effect: "a" },
            { from: "{q2,q3,q4}", to: "{q2,q3,q4}", effect: "b" },
          ],
          ["{q2,q3,q4}"],
        ),
      );
    });

    it("should determine that the converted deterministic automaton is deterministic", () => {
      const deterministicAutomaton = automaton.toDeterministic();
      expect(deterministicAutomaton.isDeterministic()).toBe(true);
    });

    it("should serialize to dot notation", () => {
      expect(automaton.serializeToDot("NFA")).toBe(
        "digraph NFA {\n" +
          '  "q0" -> "q1" [label = "a"]\n' +
          '  "q1" -> "q1" [label = "b"]\n' +
          '  "q1" -> "q2" [label = "a"]\n' +
          '  "q2" -> "q2" [label = "b"]\n' +
          '  "q2" -> "q3" [label = "b"]\n' +
          '  "q3" -> "q4" [label = "b"]\n' +
          '  "q3" -> "q1" [label = "a"]\n' +
          '  "q4" [shape = doublecircle]\n' +
          "}",
      );
    });
  });

  describe("grammar", () => {
    it("should identify if left to right grammar is regular", () => {
      const grammar = new Grammar(
        "S",
        [
          { from: ["S"], to: ["a", "S"] },
          { from: ["S"], to: ["b", "A"] },
          { from: ["A"], to: ["a", "A"] },
          { from: ["A"], to: ["b", "b"] },
        ],
        ["S", "A"],
        ["a", "b"],
      );
      expect(grammar.getClassification()).toBe("regular");
    });

    it("should identify if right to left grammar is regular", () => {
      const grammar = new Grammar(
        "S",
        [
          { from: ["S"], to: ["S", "a"] },
          { from: ["S"], to: ["A", "b"] },
          { from: ["A"], to: ["A", "a"] },
          { from: ["A"], to: ["b", "b"] },
        ],
        ["S", "A"],
        ["a", "b"],
      );
      expect(grammar.getClassification()).toBe("regular");
    });

    it("should identify if grammar is context-free", () => {
      const grammar = new Grammar(
        "S",
        [
          { from: ["S"], to: ["X", "a"] },
          { from: ["X"], to: ["a"] },
          { from: ["X"], to: ["a", "X"] },
          { from: ["X"], to: ["a", "b", "c"] },
        ],
        ["S", "X"],
        ["a", "b", "c"],
      );
      expect(grammar.getClassification()).toBe("context-free");
    });

    it("should identify if grammar is context-sensitive", () => {
      const grammar = new Grammar(
        "A",
        [
          { from: ["A", "B"], to: ["A", "b", "B", "c"] },
          { from: ["A"], to: ["b", "c", "A"] },
          { from: ["B"], to: ["c"] },
        ],
        ["A", "B"],
        ["b", "c"],
      );
      expect(grammar.getClassification()).toBe("context-sensitive");
    });

    it("should identify if grammar is recursive", () => {
      const grammar = new Grammar(
        "S",
        [
          { from: ["S"], to: ["a", "c", "B"] },
          { from: ["B", "c"], to: ["a", "c", "B"] },
          { from: ["C", "B"], to: ["D", "B"] },
          { from: ["a", "D"], to: ["D", "b"] },
        ],
        ["S", "B", "C", "D"],
        ["a", "b", "c"],
      );
      expect(grammar.getClassification()).toBe("recursive");
    });
  });
});
