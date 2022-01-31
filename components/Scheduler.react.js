import ArrowLeftIcon from "@rsuite/icons/ArrowLeft";
import ArrowRightIcon from "@rsuite/icons/ArrowRight";
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
import { book, cancelBooking } from "../lib/api";
import { MAX_DAYS_IN_ADVANCE_BOOKABLE, SLOTS } from "../lib/constants";
import {
  addDaysToDate,
  getStartHourOfDate,
  getDateString,
  confirmDialog,
  pushSuccessToast,
  getToday,
  getTimestamp,
} from "../lib/helpers";
import { useBookings, useRooms } from "../lib/hooks";
import styles from "../styles/Scheduler.module.css";

export default function Scheduler({ session }) {
  const [date, setDate] = useState(getToday());
  const {
    bookings,
    isLoading: isLoadingBookings,
    isError: isErrorBookings,
    mutate,
  } = useBookings(date.toISOString().substring(0, 10));

  const {
    rooms,
    isLoading: isLoadingRooms,
    isError: isErrorRooms,
  } = useRooms();

  const isError = isErrorBookings || isErrorRooms;
  const isLoading = isLoadingBookings || isLoadingRooms;

  const renderBookedCell = (booking) => (
    <td
      className={`${styles.cell} ${
        booking.isOwner ? styles.myBooking : styles.unavailable
      }`}
      onClick={async () => {
        if (
          booking.isOwner &&
          (await confirmDialog("Are you sure you want to cancel this booking?"))
        ) {
          await cancelBooking(booking.id).then(() => {
            pushSuccessToast("Booking cancelled successfully!");
            mutate();
          });
        }
      }}
    >
      <span>Booked</span>
    </td>
  );

  const renderCell = (date, time, roomName) => {
    const timestamp = getTimestamp(date, time);
    const booking = bookings?.[roomName]?.find(
      (b) => b.datetime === timestamp.toISOString()
    );

    if (booking) {
      return booking.fullName ? (
        <Whisper
          trigger="hover"
          placement="right"
          controlId={`control-id-${booking.datetime}-${booking.roomName}`}
          enterable
          speaker={
            <Popover title="Details (admin-only)">
              <p>
                Booked by{" "}
                <a
                  href={`mailto:${
                    booking.email
                  }?subject=EngHub%20Room%20${roomName}%20Booking%20(${timestamp.toUTCString()})`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {booking.fullName}
                </a>
                .
              </p>
            </Popover>
          }
        >
          {renderBookedCell(booking)}
        </Whisper>
      ) : (
        renderBookedCell(booking)
      );
    }

    if (timestamp < getStartHourOfDate(new Date())) {
      return <td className={styles.unavailable}>-</td>;
    }

    return (
      <td
        className={`${styles.cell} ${styles.available}`}
        onClick={async () => {
          if (await confirmDialog("Are you sure you want to book this slot?")) {
            await book(timestamp, roomName).then(() => {
              pushSuccessToast("Room booked successfully!");
              mutate();
            });
          }
        }}
      >
        Book?
      </td>
    );
  };

  const renderScheduleTable = () => (
    <table className={styles.scheduler}>
      <thead>
        <tr>
          <th className={styles.cell}>Time/Room</th>
          {rooms.map(
            (room) =>
              room.active && (
                <Whisper
                  trigger="hover"
                  placement="right"
                  controlId={`room-title-${room.name}`}
                  enterable
                  speaker={
                    <Popover title={`Capacity: ${room.capacity}`}></Popover>
                  }
                >
                  <th className={styles.cell}>{room.name}</th>
                </Whisper>
              )
          )}
        </tr>
      </thead>
      <tbody>
        {SLOTS.map((time) => (
          <tr>
            <th className={styles.cell}>{time}</th>
            {rooms.map(
              (room) => room.active && renderCell(date, time, room.name)
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDateControls = () => {
    const minDate = getToday();
    const maxDate = addDaysToDate(minDate, MAX_DAYS_IN_ADVANCE_BOOKABLE);
    maxDate.setHours(23, 59, 59);

    return (
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
            disabled={!session.user.isAdmin && addDaysToDate(date, 1) > maxDate}
          />
        </ButtonGroup>
      </div>
    );
  };

  return (
    <>
      <h4>{getDateString(date)}</h4>
      {renderDateControls()}
      {session.user.isAdmin && (
        <p>
          <i>
            Admins may hover over booked slots to see the student who booked the
            slot.
          </i>
        </p>
      )}

      {isError && (
        <Message type="error" showIcon className="error-message">
          There was an error loading the slots. Please try again later or
          contact us if the error persists.
        </Message>
      )}

      {isLoading && <Loader backdrop content="Loading..." vertical />}

      {!isError && !isLoading && renderScheduleTable()}
    </>
  );
}
