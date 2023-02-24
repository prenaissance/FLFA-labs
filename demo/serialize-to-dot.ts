import { Automaton } from "@/state-machine/automaton";
import {
  initialState,
  finalStates,
  states,
  transitions,
} from "../fixtures/lab2-state-machine";

const automaton = new Automaton(initialState, states, transitions, finalStates);

console.log(automaton.serializeToDot("NFA"));
console.log();
console.log(automaton.toDeterministic().serializeToDot("DFA"));

console.log("Show online:");
console.log(
  `https://dreampuf.github.io/GraphvizOnline/#${encodeURIComponent(
    automaton.toDeterministic().serializeToDot("DFA"),
  )}`,
);
