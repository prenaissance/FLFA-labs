declare type ArrayElement<ArrayT> = ArrayT extends Array<infer ElementT>
  ? ElementT
  : ArrayT extends ReadonlyArray<infer ElementT>
  ? ElementT
  : never;
