import { Transition } from "@/state-machine/automaton";

export const initialState = "q0";
export const states = ["q0", "q1", "q2", "q3", "q4"];
export const finalStates = ["q4"];
export const transitions: Transition[] = [
  { from: "q0", to: "q1", effect: "a" },
  { from: "q1", to: "q1", effect: "b" },
  { from: "q1", to: "q2", effect: "a" },
  { from: "q2", to: "q2", effect: "b" },
  { from: "q2", to: "q3", effect: "b" },
  { from: "q3", to: "q4", effect: "b" },
  { from: "q3", to: "q1", effect: "a" },
];
