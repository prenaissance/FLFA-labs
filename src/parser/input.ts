import * as O from "fp-ts/Option";
import { ParsingError } from "@/language-parser/errors";
import { flow } from "fp-ts/function";

export interface Input {
  readonly text: string;
  readonly index: number;
}

export const of = (text: string, index = 0): Input => ({
  text,
  index,
});

export const error = (input: Input) =>
  new ParsingError("Unexpected word at index " + input.index, input.index);

export const next = flow(
  O.fromPredicate((input: Input) => input.index < input.text.length),
  O.map(({ text, index }) => [text[index], of(text, index + 1)] as const),
);
