import { confirm } from "@rsuite/interactions";
import { Notification, toaster } from "rsuite";

export const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const getWeekStartAndEndFromDate = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  const start = new Date(date.setDate(diff));
  start.setHours(0, 0, 0);
  // const start = new Date(date.setDate(date.getDate() - date.getDay() + 1));
  const end = new Date(date.setDate(date.getDate() - date.getDay() + 7));
  end.setHours(23, 59, 59);
  return { start, end };
};

export const addDaysToDate = (date, numDays) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + numDays);
  return newDate;
};

export const getStartHourOfDate = (date) => {
  // e.g., turn 12:11:00 into 12:00:00
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours(), 0, 0, 0);
  return newDate;
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
    <Notification closable type="success" header="Success" duration={0}>
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

export const request = async (url, fetchOpts) => fetch(url, fetchOpts)
    .then((res) => res.json())
    .then((res) => {
      if (res.error) pushErrorToast(res.message);
      return res;
    })
    .catch((err) => {
      console.error(err);
      pushErrorToast(err.message);
    });
