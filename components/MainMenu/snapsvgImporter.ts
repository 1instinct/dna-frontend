const SnapSvg = () => {
  // snapsvg-cjs touches window on import, so it may fail outside the browser.
  try {
    return require("snapsvg-cjs");
  } catch {
    return undefined;
  }
};
export default SnapSvg;
