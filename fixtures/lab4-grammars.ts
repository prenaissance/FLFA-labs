import { Grammar, Production } from "@/grammar/grammar";

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

export const v2Grammar = new Grammar(
  v2Start,
  v2Productions,
  v2NonTerminals,
  v2Terminals,
);

const v13Start = "S";
const v13NonTerminals = ["S", "A", "B", "C", "D"];
const v13Terminals = ["a", "b"];
const v13Productions: Production[] = [
  { from: ["S"], to: ["a", "B"] },
  { from: ["S"], to: ["D", "A"] },
  { from: ["A"], to: ["a"] },
  { from: ["A"], to: ["B", "D"] },
  { from: ["A"], to: ["b", "D", "A", "B"] },
  { from: ["B"], to: ["b"] },
  { from: ["B"], to: ["B", "A"] },
  { from: ["D"], to: [] },
  { from: ["D"], to: ["B", "A"] },
  { from: ["C"], to: ["B", "A"] },
];

export const v13Grammar = new Grammar(
  v13Start,
  v13Productions,
  v13NonTerminals,
  v13Terminals,
);
