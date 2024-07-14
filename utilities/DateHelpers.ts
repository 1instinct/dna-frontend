const oneDay = 24 * 60 * 60 * 1000;

export const addDays = (date: any, days: any) => {
  const dat = new Date(date);
  dat.setDate(dat.getDate() + days);
  return dat;
};

export const isADate = (maybeDate: any) => {
  if (maybeDate == null || maybeDate === "") return false;
  if (Object.prototype.toString.call(maybeDate) === "[object Date]") {
    if (Number.isNaN(maybeDate.getTime())) {
      return false;
    }
    return true;
  }
  return false;
};

export const toShortDateZeroFill = (date: any) => {
  if (!isADate(date)) return null;
  const monthFormat = `0${date.getMonth() + 1}`;
  const dayFormat = `0${date.getDate()}`;
  return `${monthFormat.slice(-2)}/${dayFormat.slice(
    -2
  )}/${date.getFullYear()}`;
};

export const dayDiff = (date1: any, date2: any) => {
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
};

export const daysSinceToday = (date: any) => {
  if (!isADate(date)) return null;
  return dayDiff(new Date(), date);
};

export const daysThisYear = () => {
  const now: any = new Date();
  const start: any = new Date(now.getFullYear(), 0, 0);
  const diff =
    now -
    start +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneDayThisYear = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDayThisYear);
  return day;
};

export const normalizeDate = (value: any) => {
  if (!value) {
    return value;
  }

  const onlyNums = value.replace(/[^\d]/g, "");
  const trailingSlash = value.slice(-1) === "/" ? "/" : "";
  if (onlyNums.length === 1 && trailingSlash) {
    return `0${onlyNums}${trailingSlash}`;
  }
  if (onlyNums.length <= 2) {
    return `${onlyNums}${trailingSlash}`;
  }
  if (onlyNums.length === 3 && trailingSlash) {
    return `${onlyNums.slice(0, 2)}/0${onlyNums.slice(2)}${trailingSlash}`;
  }
  if (onlyNums.length <= 4) {
    return `${onlyNums.slice(0, 2)}/${onlyNums.slice(2)}${trailingSlash}`;
  }
  return `${onlyNums.slice(0, 2)}/${onlyNums.slice(2, 4)}/${onlyNums.slice(
    4,
    8
  )}`;
};
