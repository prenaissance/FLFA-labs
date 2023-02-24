import { describe, it, expect } from "vitest";
import { Automaton } from "@/state-machine/automaton";
import {
  finalStates,
  initialState,
  states,
  transitions,
} from "fixtures/lab2-state-machine";

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
  });
});
