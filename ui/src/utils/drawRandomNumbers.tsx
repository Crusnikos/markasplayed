export default function drawRandomNumbers(props: {
  drawFrom: number;
  drawThisMany: number;
}): number[] {
  const { drawFrom, drawThisMany } = props;
  const arr: number[] = [];

  if (drawThisMany === 0) {
    return arr;
  }

  do {
    const randomNumber = Math.floor(Math.random() * drawFrom) + 1;

    if (!arr.includes(randomNumber)) {
      arr.push(randomNumber);
    }
  } while (arr.length < drawThisMany);

  return arr;
}
