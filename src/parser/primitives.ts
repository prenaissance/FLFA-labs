import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as I from "./input";
import { pipe } from "fp-ts/function";
import { ParserError, ParserResult } from "./parser";

export const char = (c: string) => (input: I.Input) =>
  pipe(
    I.next(input),
    O.chain(O.fromPredicate((input) => input.text[input.index] === c)),
    E.fromOption<ParserError>(() => ({ input, expected: [c] })),
    E.map((input) => ({ value: c, nextInput: input })),
  ) as ParserResult<string>;
