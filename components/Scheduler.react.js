import ArrowLeftIcon from "@rsuite/icons/ArrowLeft";
import ArrowRightIcon from "@rsuite/icons/ArrowRight";
import { confirm } from "@rsuite/interactions";
import { useState } from "react";
import {
  ButtonGroup,
  DatePicker,
  IconButton,
  Loader,
  Message,
  Popover,
  Whisper,
} from "rsuite";
import useSWR from "swr";
import { MAX_DAYS_IN_ADVANCE_BOOKABLE, ROOMS, SLOTS } from "../lib/constants";
import {
  addDaysToDate,
  fetcher,
  getStartHourOfDate,
  pushErrorToast,
  getDateString,
} from "../lib/helpers";
import styles from "../styles/Scheduler.module.css";

const book = async (datetime, room) => {
  return await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ datetime, room }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.error) pushErrorToast(res.message);
      return res;
    })
    .catch((err) => {
      console.error(err);
      pushErrorToast(err.message);
    });
};

const useBookings = (date) => {
  const { data, error, mutate } = useSWR(`/api/bookings?date=${date}`, fetcher);
  return {
    bookings: data ? data.bookings : {},
    isLoading: !error && !data,
    isError: error || data?.error,
    mutate,
  };
};

const getToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0);
  return date;
};

export default function Scheduler({ session }) {
  const [date, setDate] = useState(getToday());
  const { bookings, isLoading, isError, mutate } = useBookings(
    date.toISOString().substring(0, 10)
  );

  const getTimestamp = (date, time) => {
    const newDate = new Date(date);
    newDate.setHours(...time.split(":"), 0, 0);
    return newDate;
  };

  const renderCell = (date, time, room) => {
    const timestamp = getTimestamp(date, time);

    const booking = bookings?.[room]?.find(
      (b) => b.datetime === timestamp.toISOString()
    );

    if (booking) {
      return booking.cn ? (
        <Whisper
          trigger="hover"
          placement="right"
          controlId={`control-id-${booking.datetime}-${booking.room}`}
          enterable
          speaker={
            <Popover title="Details (admin-only)">
              <p>
                Booked by{" "}
                <a
                  href={`mailto:${
                    booking.cn
                  }@ucl.ac.uk}?subject=EngHub%20Room%20${room}%20Booking%20(${timestamp.toUTCString()})`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {booking.cn}
                </a>
                .
              </p>
            </Popover>
          }
        >
          <td
            className={`${styles.cell} ${
              booking.isOwner ? styles.myBooking : styles.unavailable
            }`}
          >
            Booked
          </td>
        </Whisper>
      ) : (
        <td
          className={`${styles.cell} ${
            booking.isOwner ? styles.myBooking : styles.unavailable
          }`}
        >
          Booked
        </td>
      );
    }

    if (timestamp < getStartHourOfDate(new Date())) {
      return <td className={styles.unavailable}>-</td>;
    }

    return (
      <td
        className={`${styles.cell} ${styles.available}`}
        onClick={async () => {
          if (
            await confirm("Are you sure you want to book this slot?", {
              okButtonText: "Yes",
              cancelButtonText: "No",
            })
          ) {
            await book(timestamp, room);
            mutate();
          }
        }}
      >
        Book?
      </td>
    );
  };

  const renderContent = () => {
    if (isError) {
      return (
        <Message type="error" showIcon className="error-message">
          There was an error loading the slots. Please try again later or
          contact us if the error persists.
        </Message>
      );
    }

    if (isLoading) {
      return <Loader backdrop content="Loading..." vertical />;
    }

    return (
      <table className={styles.scheduler}>
        <thead>
          <tr>
            <th className={styles.cell}>Time/Room</th>
            {ROOMS.map((room) => (
              <th className={styles.cell}>{room}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SLOTS.map((time) => (
            <tr>
              <th className={styles.cell}>{time}</th>
              {ROOMS.map((room) => renderCell(date, time, room))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const minDate = getToday();
  const maxDate = addDaysToDate(minDate, MAX_DAYS_IN_ADVANCE_BOOKABLE);
  maxDate.setHours(23, 59, 59);

  return (
    <>
      <h4>{getDateString(date)}</h4>
      <div className={styles.dateControls}>
        <DatePicker
          placeholder="Go to date"
          onChange={(date) => {
            const newDate = date == null ? new Date() : date;
            newDate.setHours(0, 0, 0);
            setDate(newDate);
          }}
          disabledDate={(date) =>
            date < minDate || (!session.user.isAdmin && date > maxDate)
          }
          ranges={[
            { label: "today", value: new Date() },
            { label: "Tomorrow", value: (date) => addDaysToDate(date, 1) },
          ]}
          oneTap
        />
        <ButtonGroup className={styles.dateArrows}>
          <IconButton
            icon={<ArrowLeftIcon />}
            onClick={() => setDate((oldDate) => addDaysToDate(oldDate, -1))}
            disabled={date <= minDate}
          />
          <IconButton
            icon={<ArrowRightIcon />}
            onClick={() => setDate((oldDate) => addDaysToDate(oldDate, 1))}
            disabled={addDaysToDate(date, 1) >= maxDate}
          />
        </ButtonGroup>
      </div>

      {session.user.isAdmin && (
        <p>
          <i>
            Admins may hover over booked slots to see the student who booked the
            slot.
          </i>
        </p>
      )}

      {renderContent()}
    </>
  );
}
