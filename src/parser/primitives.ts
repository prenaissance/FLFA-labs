import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import { pipe } from "fp-ts/function";
import * as I from "./input";
import { ParserError, ParserResult, success } from "./parser";
import { oneOf } from "./combinators";

export const char = (c: string) => (input: I.Input) =>
  pipe(
    I.next(input),
    O.chain(O.fromPredicate(([chr]) => chr === c)),
    E.fromOption<ParserError>(() => ({ input, expected: [c] })),
    E.map(([chr, nextInput]) => ({ value: chr, nextInput })),
  ) as ParserResult<string>;

export const digit = oneOf(...pipe("01234567890".split(""), RA.map(char)));
export const whitespace = oneOf(char(" "), char("\t"), char("\r"), char("\n"));

export const str = (s: string) => (input: I.Input) =>
  pipe(
    s.split(""),
    RA.map(char),
    RA.reduce(success("", input), (acc, parser) =>
      pipe(
        acc,
        E.chain((acc) =>
          pipe(
            parser(acc.nextInput),
            E.map((success) => ({
              value: acc.value + success.value,
              nextInput: success.nextInput,
            })),
          ),
        ),
        E.mapLeft(() => ({
          input,
          expected: [s],
        })),
      ),
    ),
  ) as ParserResult<string>;
