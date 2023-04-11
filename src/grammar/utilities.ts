export const areArraysEqual = (a: any[], b: any[]) => {
  if (a === b) return true;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const getCombinations: <T>(arr: T[]) => T[][] = <T>(arr: T[]) => {
  const map = new Map<string, T[]>();
  const combinations = (arr: T[]) => {
    const key = arr.join(",");
    if (map.has(key)) {
      return;
    }
    map.set(key, arr);
    arr.forEach((_, i) => {
      combinations(arr.filter((_, j) => i !== j));
    });
  };
  combinations(arr);
  return [...map.values()];
};

export const combinationsWithout =
  <T>(element: T) =>
  (arr: T[]) => {
    const indices = arr.reduce((acc, curr, i) => {
      if (curr === element) return [...acc, i];
      return acc;
    }, [] as number[]);
    const indicesCombinations = getCombinations(indices);
    const combinations = indicesCombinations.map((indices) => {
      return arr.filter((_, i) => !indices.includes(i));
    });
    // remove duplicates
    return combinations.filter((c, i) => {
      return combinations.findIndex((c2) => areArraysEqual(c, c2)) === i;
    });
  };
