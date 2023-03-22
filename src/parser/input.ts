import * as O from "fp-ts/Option";
import { flow } from "fp-ts/function";

export interface Input {
  readonly text: string;
  readonly index: number;
}

export const of = (text: string, index = 0): Input => ({
  text,
  index,
});

export const next = flow(
  O.fromPredicate((input: Input) => input.index < input.text.length),
  O.map(({ text, index }) => [text[index], of(text, index + 1)] as const),
);
