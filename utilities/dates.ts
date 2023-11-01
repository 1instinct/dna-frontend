export const currentSeason = () => {
  const date = new Date();
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) {
    return "Spring";
  } else if (month >= 6 && month <= 8) {
    return "Summer";
  } else if (month >= 9 && month <= 11) {
    return "Fall";
  } else {
    return "Winter";
  }
};
