import * as RA from "fp-ts/ReadonlyArray";
import * as E from "fp-ts/Either";
import * as P from "../parser";
import { flow } from "fp-ts/function";

export const number = flow(
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
