import * as E from "fp-ts/Either";
import * as I from "./input";
import { flow } from "fp-ts/function";

export type ParserSuccess<A> = {
  value: A;
  nextInput: I.Input;
};

export type ParserError = {
  input: I.Input;
  expected: string[];
};

export type ParserResult<A> = E.Either<ParserError, ParserSuccess<A>>;

export type Parser<A> = (input: I.Input) => ParserResult<A>;

export type inferParserType<T> = T extends Parser<infer A> ? A : never;

export const run =
  (text: string) =>
  <A>(parser: Parser<A>) =>
    parser(I.of(text));

// always succeeds without consuming any input
export const success =
  <A>(value: A): Parser<A> =>
  (nextInput) =>
    E.right({ value, nextInput });

export const error = <A = any>(
  input: I.Input,
  expected: string[],
): ParserResult<A> => E.left({ input, expected }) as ParserResult<A>;

export const absurd = <A = any>(input: I.Input) =>
  E.left({ input, expected: ["never"] }) as ParserResult<A>;

export const mapResult = <A, B>(
  f: (a: A) => B,
): ((result: ParserResult<A>) => ParserResult<B>) =>
  E.map(({ value, nextInput }) => ({
    value: f(value),
    nextInput,
  }));

export const map =
  <A, B>(f: (a: A) => B) =>
  (parser: Parser<A>) =>
    flow(parser, mapResult(f));

export const chain =
  <A, B>(f: (a: A) => Parser<B>) =>
  (parser: Parser<A>) =>
    flow(
      parser,
      E.chain(({ value, nextInput }) => f(value)(nextInput)),
    );
