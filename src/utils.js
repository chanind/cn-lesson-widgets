/* @flow */

// based on https://stackoverflow.com/a/12646864
// retuns a new array that's shuffled
export function shuffleArray<T>(array: Array<T>): Array<T> {
    const shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffledArray[i];
        shuffledArray[i] = shuffledArray[j];
        shuffledArray[j] = temp;
    }
    return shuffledArray
}

// returns a new array with the item removed
export function removeArrayItem<T>(array: Array<T>, item: T): Array<T> {
  const itemIndex = array.indexOf(item);
  if (itemIndex >= 0) {
    const arrCopy = array.slice();
    arrCopy.splice(itemIndex, 1);
    return arrCopy;
  }
  return array;
}