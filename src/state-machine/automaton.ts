import { RegularGrammar, RegularProduction } from "@/grammar/regular-grammar";

export type Transition = {
  readonly from: string;
  readonly to: string;
  readonly effect: string;
};

const formatCompositeState = (states: string[]): string => {
  if (states.length === 0) {
    return "";
  }
  if (states.length === 1) {
    return states[0];
  }
  return `{${states.join(",")}}`;
};

const unpackCompositeState = (state: string): string[] => {
  if (state.startsWith("{") && state.endsWith("}")) {
    return state.slice(1, -1).split(",");
  }
  return [state];
};

export class Automaton {
  private readonly _initialState: string;
  private readonly _states: string[];
  private readonly _effects: string[];
  private readonly _transitions: Transition[];
  private readonly _finalStates: string[];

  constructor(
    initialState: string,
    states: string[],
    transitions: Transition[],
    finalStates: string[],
  ) {
    this._initialState = initialState;
    this._states = states;
    this._transitions = transitions;
    this._finalStates = finalStates;

    this._effects = [...new Set(transitions.map((t) => t.effect))];
  }

  private transitionToProduction(transition: Transition): RegularProduction {
    const isFinal = this._finalStates.includes(transition.to);
    if (isFinal) {
      return {
        from: transition.from,
        to: [transition.effect],
      };
    }
    return {
      from: transition.from,
      to: [transition.effect, transition.to],
    };
  }

  toGrammar(): RegularGrammar {
    const productions: RegularProduction[] = this._transitions.reduce(
      (prods, transition) => {
        return [...prods, this.transitionToProduction(transition)];
      },
      [] as RegularProduction[],
    );

    return {
      start: this._initialState,
      productions,
      nonTerminal: this._states,
      terminal: this._effects,
    };
  }

  isDeterministic(): boolean {
    const signatureSet = new Set<string>();
    let collisionFound = false;
    this._transitions.forEach((transition) => {
      const signature = `${transition.from}-${transition.effect}`;
      if (signatureSet.has(signature)) {
        collisionFound = true;
      }
      signatureSet.add(signature);
    });

    return !collisionFound;
  }

  toDeterministic(): Automaton {
    const queue: string[] = [this._initialState];
    const states = new Set<string>();
    const transitions: Transition[] = [];
    const finalStates = new Set<string>();

    while (queue.length > 0) {
      const state = queue.shift()!;
      states.add(state);

      const unpackedState = unpackCompositeState(state);
      const isFinal = unpackedState.some((s) => this._finalStates.includes(s));

      if (isFinal) {
        finalStates.add(state);
      }

      this._effects.forEach((effect) => {
        const toStates = unpackedState.reduce((acc, s) => {
          const transitions = this._transitions.filter(
            (t) => t.from === s && t.effect === effect,
          );
          return [...acc, ...transitions.map((t) => t.to)];
        }, [] as string[]);

        const toState = formatCompositeState(toStates);
        if (toState !== "") {
          transitions.push({
            from: state,
            to: toState,
            effect,
          });
          if (!states.has(toState)) {
            queue.push(toState);
          }
        }
      });
    }
    return new Automaton(this._initialState, [...states], transitions, [
      ...finalStates,
    ]);
  }

  serializeToDot(name = "automaton"): string {
    const header = `digraph ${name} {`;
    const transitions = this._transitions.map(
      (t) => `  "${t.from}" -> "${t.to}" [label = "${t.effect}"]`,
    );
    const finalStates = this._finalStates.map(
      (s) => `  "${s}" [shape = doublecircle]`,
    );
    return [header, ...transitions, ...finalStates, "}"].join("\n");
  }
}
