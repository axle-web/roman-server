export enum FileMimes {
  IMAGE = "image/png image/jpg image/jpeg image/webp",
}

export type FileMimesTypes = keyof typeof FileMimes;

export interface FixedLengthArray<L extends number, T> extends ArrayLike<T> {
  length: L;
}
