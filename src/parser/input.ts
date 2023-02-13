export interface Input<T = string> {
  readonly input: T;
  readonly index: number;
}

export function createInput<T = string>(input: T): Input<T>;
export function createInput<T = string>(input: T, index: number): Input<T>;
export function createInput<T = string>(input: T, index = 0): Input<T> {
  return {
    input,
    index,
  };
}

export function createStringInput<T>(input: string) {
  return createInput<T>([...input] as unknown as T);
}
