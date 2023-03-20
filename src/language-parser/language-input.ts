export interface Input {
  readonly input: string[];
  readonly index: number;
}

export function createInput(input: string[]): Input;
export function createInput(input: string[], index: number): Input;
export function createInput(input: string[], index = 0): Input {
  return {
    input,
    index,
  };
}

export function createStringInput(input: string) {
  return createInput([...input]);
}
