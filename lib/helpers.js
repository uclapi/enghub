import { confirm } from "@rsuite/interactions";
import { Notification, toaster } from "rsuite";
import { MAX_DAYS_IN_ADVANCE_BOOKABLE } from "./constants";

export const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const getWeekStartAndEndFromDate = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day == 0 ? -6 : 1);
  const start = new Date(date.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(date.setDate(date.getDate() - date.getDay() + 7));
  end.setHours(23, 59, 59);
  return { start, end };
};

export const getToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getTimestamp = (date, time) => {
  const newDate = new Date(date);
  newDate.setHours(...time.split(":"), 0, 0, 0);
  return newDate;
};

export const addDaysToDate = (date, numDays, skipWeekends = false) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + numDays);
  if (skipWeekends) {
    let daysToAdd = 0;
    if (newDate.getDay() == 0) {
      // If new date is Sun, skip back 2 days or forward 1 day
      daysToAdd = numDays < 0 ? -2 : 1;
    } else if (newDate.getDay() == 6) {
      // If new date is Sat, skip back 1 day or forward 2 days
      daysToAdd = numDays < 0 ? -1 : 2;
    }
    newDate.setDate(newDate.getDate() + daysToAdd);
  }
  return newDate;
};

export const getStartHourOfDate = (date) => {
  // e.g., turn 12:11:00 into 12:00:00
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours(), 0, 0, 0);
  return newDate;
};

// Non-admins can only book 7 days in advance
// But we want to give them till midnight of the final day of the 7-day period
// e.g., today (00:00) is Tuesday, non-admins can book till 00:00 next Wednesday
export const getLatestDateBookableByNonAdmins = () =>
  addDaysToDate(getToday(), MAX_DAYS_IN_ADVANCE_BOOKABLE + 1);

export const getShortDateString = (date) => {
  const offset = date.getTimezoneOffset();
  const newDate = new Date(date.getTime() - offset * 60 * 1000);
  return newDate.toISOString().split("T")[0];
};

export const getDateString = (date) => {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getDateTimeString = (date) => {
  return date.toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

export const pushErrorToast = (message) => {
  toaster.push(
    <Notification closable type="error" header="Error" duration={0}>
      {message}
    </Notification>,
    { placement: "topCenter" }
  );
};

export const pushSuccessToast = (message) => {
  toaster.push(
    <Notification closable type="success" header="Success" duration={3000}>
      {message}
    </Notification>,
    { placement: "topCenter" }
  );
};

export const confirmDialog = async (message) =>
  await confirm(message, {
    okButtonText: "Yes",
    cancelButtonText: "No",
  });

export const request = async (url, fetchOpts) =>
  fetch(url, fetchOpts)
    .then((res) => res.json())
    .then((res) => {
      if (res.error) throw new Error(res.message);
      return res;
    })
    .catch((err) => {
      console.error(err);
      pushErrorToast(err.message);
      return Promise.reject();
    });
