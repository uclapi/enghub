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
import {
  MAX_DAYS_IN_ADVANCE_BOOKABLE,
  WEEKDAY_SLOTS,
  WEEKEND_SLOTS
} from "../lib/constants";
import {
  addDaysToDate,
  getStartHourOfDate,
  getShortDateString,
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
  } = useBookings(getShortDateString(date));

  const {
    rooms,
    isLoading: isLoadingRooms,
    isError: isErrorRooms,
  } = useRooms();

  const isError = isErrorBookings || isErrorRooms;
  const isLoading = isLoadingBookings || isLoadingRooms;

  const slots = date.getDay() == 6 || date.getDay() == 0 ? WEEKEND_SLOTS : WEEKDAY_SLOTS;

  const isUserAllowedToBookRoom = (room) =>
    !(room.admin_only && !session.user.isAdmin);

  const renderBookedCell = (booking, timestamp) => (
    <Whisper
      trigger="hover"
      placement="left"
      controlId={`control-id-${booking.datetime}-${booking.roomName}`}
      enterable
      speaker={
        <Popover
          title={
            booking.fullName && session.user.isAdmin
              ? "Details (admin-only)"
              : "Details"
          }
        >
          <p>
            {session.user.isAdmin && (
              <>
                Booked by{" "}
                <a
                  href={`mailto:${
                    booking.email
                  }?subject=EngHub%20Room%20${booking.roomName}%20Booking%20(${timestamp.toUTCString()})`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {booking.fullName}
                </a>
                .
                <br />
              </>
            )}
            Booking ID: {booking.id.substring(0, 5)}.
          </p>
        </Popover>
      }
    >
      <td
        className={`${styles.cell} ${
          booking.isOwner ? styles.myBooking : styles.unavailable
        }`}
        onClick={async () => {
          if (
            booking.isOwner &&
            (await confirmDialog(
              "Are you sure you want to cancel this booking?"
            ))
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
    </Whisper>
  );

  const renderCell = (date, time, room) => {
    const timestamp = getTimestamp(date, time);
    const booking = bookings?.[room.name]?.find(
      (b) => b.datetime === timestamp.toISOString()
    );

    if (booking) {
      return renderBookedCell(booking, timestamp);
    }

    if (timestamp < getStartHourOfDate(new Date())) {
      return <td className={styles.unavailable}>-</td>;
    }

    return (
      <td
        className={`${styles.cell} ${styles.available} ${!isUserAllowedToBookRoom(room) ? styles.disabled : ""}`}
        onClick={async () => {
          if (
            isUserAllowedToBookRoom(room) &&
            (await confirmDialog("Are you sure you want to book this slot?"))
          ) {
            await book(timestamp, room.name).then(() => {
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
    <div className={styles.schedulerWrapper}>
      <table className={styles.scheduler}>
        <thead>
          <tr>
            <th className={`${styles.cell} ${styles.stickyCell}`}>Time/Room</th>
            {rooms.map(
              (room) =>
                room.active && (
                  <Whisper
                    trigger="hover"
                    placement="left"
                    controlId={`room-title-${room.name}`}
                    enterable
                    speaker={
                      <Popover
                        title={`Capacity: ${room.capacity} ${room.admin_only ? '(only admins can book this room)' : ''}`} />
                    }
                  >
                    <th className={`${styles.cell} ${!isUserAllowedToBookRoom(room) ? styles.disabled : ''}`}>{room.name}</th>
                  </Whisper>
                )
            )}
          </tr>
        </thead>
        <tbody>
          {slots.map((time) => (
            <tr>
              <th className={`${styles.cell} ${styles.stickyCell}`}>{time}</th>
              {rooms.map(
                (room) => room.active && renderCell(date, time, room)
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
            const newDate = date == null ? getToday() : date;
            newDate.setHours(0, 0, 0, 0);
            setDate(newDate);
          }}
          disabledDate={(date) =>
            (!session.user.isAdmin && (date < minDate || date > maxDate) || date.getDay() % 6 == 0)
          }
          ranges={[
            { label: "today", value: new Date() },
            { label: "Tomorrow", value: (date) => addDaysToDate(date, 1, true) },
          ]}
          oneTap
        />

        <ButtonGroup className={styles.dateArrows}>
          <IconButton
            icon={<ArrowLeftIcon />}
            onClick={() => setDate((oldDate) => addDaysToDate(oldDate, -1, true))}
            disabled={!session.user.isAdmin && date <= minDate}
          />
          <IconButton
            icon={<ArrowRightIcon />}
            onClick={() => setDate((oldDate) => addDaysToDate(oldDate, 1, true))}
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
