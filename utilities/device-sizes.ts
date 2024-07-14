export const pxIphoneX: (px: number) => string = (px) =>
  (100 * px) / 414 + "vw";
export const pxIphone: (px: number) => string = (px) => (100 * px) / 375 + "vw";
export const pxPC: (px: number) => string = (px) => (100 * px) / 1440 + "vw";
