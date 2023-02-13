export class ParserError extends Error {
  readonly index: number;
  constructor(message: string, index: number) {
    super(message);
    this.index = index;
  }
}
