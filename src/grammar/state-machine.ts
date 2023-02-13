// * Maybe dead code
export type Transition<StateT, EffectT> = [StateT, StateT, EffectT];

export interface StateMachine<StateT, EffectT> {
  readonly states: StateT[];
  readonly start: StateT;
  readonly transitions: Transition<StateT, EffectT>[];
  readonly end: StateT[];
}

export function createStateMachine<StateT, EffectT>(
  states: StateT[],
  start: StateT,
  transitions: Transition<StateT, EffectT>[],
  end: StateT[],
): StateMachine<StateT, EffectT> {
  return Object.freeze({
    states,
    start,
    transitions,
    end,
  });
}
