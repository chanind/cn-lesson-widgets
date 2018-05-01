/* @flow */

// from https://stackoverflow.com/a/12646864
export function shuffleArray<T>(array: Array<T>): Array<T> {
    const shuffledArray = array.slice(0);
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffledArray[i];
        shuffledArray[i] = shuffledArray[j];
        shuffledArray[j] = temp;
    }
    return shuffledArray
}

// helper to work like 3.times { ... } in ruby
export function times(num: number): Array<number> {
  const res = [];
  for (let i = 0; i < num; i++) {
    res[i] = i;
  }
  return res;
}
