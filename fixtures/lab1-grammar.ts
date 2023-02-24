import { Production } from "@/grammar";

export const nonTerminal = ["a", "b", "c", "d", "e", "f"] as const;

export const terminal = ["S", "R", "L"] as const;

export type Lab1Vocabulary =
  | (typeof nonTerminal)[number]
  | (typeof terminal)[number];
export const productions: ReadonlyArray<Production<Lab1Vocabulary>> = [
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
