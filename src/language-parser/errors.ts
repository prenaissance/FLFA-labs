export class ParsingError extends Error {
  readonly index: number;
  constructor(message: string, index: number) {
    super(message);
    this.index = index;
  }
}
