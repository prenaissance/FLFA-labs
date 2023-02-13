import { Input } from "./input";

export const parseChar = (char: string) => (input: Input) => {
  return input.input[input.index] === char;
};
