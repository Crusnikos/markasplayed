import { Dispatch, SetStateAction } from "react";

export const onForwardIndexWithLoop = (
  images: any[],
  currentIndex: number,
  setCurrentIndex: Dispatch<SetStateAction<number>>
) => {
  if (!images) return;
  if (currentIndex + 1 === 5 || currentIndex + 1 === images.length) {
    setCurrentIndex(0);
  } else {
    setCurrentIndex(currentIndex + 1);
  }
};
export const onBackwardIndexWithLoop = (
  images: any[],
  currentIndex: number,
  setCurrentIndex: Dispatch<SetStateAction<number>>
) => {
  if (!images) return;
  if (currentIndex - 1 === -1) {
    setCurrentIndex(images.length - 1);
  } else {
    setCurrentIndex(currentIndex - 1);
  }
};

export const onForwardIndex = (
  images: any[],
  currentIndex: number,
  setCurrentIndex: Dispatch<SetStateAction<number>>
) => {
  if (!images) return;
  if (currentIndex + 1 === images.length) {
    return;
  } else {
    setCurrentIndex(currentIndex + 1);
  }
};
export const onBackwardIndex = (
  images: any[],
  currentIndex: number,
  setCurrentIndex: Dispatch<SetStateAction<number>>
) => {
  if (!images) return;
  if (currentIndex - 1 === -1) {
    return;
  } else {
    setCurrentIndex(currentIndex - 1);
  }
};
