/** The capture routes exist only in a dev server started by `pnpm og:build`. */
export const isSocialCapture = (): boolean =>
  process.env.NODE_ENV === "development" &&
  process.env.VIDEORC_UI_SOCIAL_CAPTURE === "1";
