type Vocabulary = string[];

export enum States {
  A = "A",
}

export interface Grammar<StateT> {
  states: StateT[];
  start: StateT;
  transitions: [StateT, StateT][];
  end: StateT[];
}
