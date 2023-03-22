import * as RA from "fp-ts/ReadonlyArray";
import * as E from "fp-ts/Either";
import * as P from "../parser";
import { flow } from "fp-ts/function";

export const number: P.Parser<number> = flow(
  P.sequence(
    P.optional(P.char("-")),
    P.oneOf(P.char("0"), P.many1(P.digit)),
    P.optional(P.sequence(P.char("."), P.many1(P.digit))),
    P.optional(
      P.sequence(
        P.oneOf(P.char("e"), P.char("E")),
        P.optional(P.char("-")),
        P.many1(P.digit),
      ),
    ),
  ),
  P.mapResult((arr) => arr.flat(3).join("")),
  P.mapResult((s) => Number(s)),
);

export const str: P.Parser<string> = flow(
  P.between(P.char('"'), P.char('"'))(P.many(P.except(P.char('"'))(P.anyChar))),
  P.mapResult((arr) => arr.join("")),
);

export const bool: P.Parser<boolean> = flow(
  P.oneOf(P.str("true"), P.str("false")),
  P.mapResult((s) => s === "true"),
);

export const null_: P.Parser<null> = flow(
  P.str("null"),
  P.mapResult(() => null),
);

export const primitive = P.oneOf(number, str, bool, null_);
type Primitive = P.inferParserType<typeof primitive>;
