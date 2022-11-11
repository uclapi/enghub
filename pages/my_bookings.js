import { getSession } from "next-auth/react";
import Head from "next/head";
import { Button, Loader, Message, Panel } from "rsuite";
import LoginMessage from "../components/LoginMessage.react";
import { cancelBooking } from "../lib/api";
import { MAX_MINUTES_BOOKABLE_PER_WEEK } from "../lib/constants";
import { confirmDialog, getDateTimeString } from "../lib/helpers";
import { useMyBookings } from "../lib/hooks";

const splitPastFutureBookings = (arr) => {
  const now = new Date();

  return arr.reduce(
    (acc, cur) => {
      if (new Date(cur.datetime) < now) {
        acc[0].push(cur);
      } else {
        acc[1].push(cur);
      }

      return acc;
    },
    [[], []]
  );
};

export default function MyBookings({ session }) {
  const { bookings, isLoading, isError, mutate } = useMyBookings();

  const renderFutureBooking = (booking) => (
    <>
      {getDateTimeString(new Date(booking.datetime))} - Room {booking.room_name}{" "}
      ({booking.building_name}){" "}
      <Button
        color="red"
        appearance="ghost"
        onClick={async () => {
          if (
            await confirmDialog("Are you sure you want to cancel this booking?")
          ) {
            await cancelBooking(booking.id);
            mutate();
          }
        }}
      >
        Cancel?
      </Button>
    </>
  );

  const renderPastBooking = (booking) => (
    <>
      {getDateTimeString(new Date(booking.datetime))} - Room {booking.room_name}{" "}
      ({booking.building_name})
    </>
  );

  const renderBookings = (bookings) => {
    const [past, future] = splitPastFutureBookings(bookings);

    return (
      <>
        <h3>Future Bookings</h3>
        {future.length ? (
          <ul className="my_bookings">
            {future.map((b) => (
              <li key={`booking-${b.id}`}>{renderFutureBooking(b)}</li>
            ))}
          </ul>
        ) : (
          <p>No bookings</p>
        )}

        <h3>Past bookings</h3>
        {past.length ? (
          <ul className="my_bookings">
            {past.map((b) => (
              <li key={`booking-${b.id}`}>{renderPastBooking(b)}</li>
            ))}
          </ul>
        ) : (
          <p>No bookings</p>
        )}
      </>
    );
  };

  return (
    <>
      <Head>
        <title>My Bookings - UCL Engineering Hub</title>
      </Head>

      <Panel header={<h2>Your Bookings</h2>} bordered className="card">
        {!session && <LoginMessage />}

        {session && isLoading && (
          <Loader backdrop content="Loading..." vertical />
        )}

        {session && isError && (
          <Message type="error" showIcon className="error-message">
            There was an error loading the slots. Please try again later or
            contact us if the error persists.
          </Message>
        )}

        {!session?.user?.isAdmin && (
          <p>
            Please note that you can only book a maximum of{" "}
            {MAX_MINUTES_BOOKABLE_PER_WEEK} minutes per week.
          </p>
        )}

        {session && !isLoading && !isError && renderBookings(bookings)}
      </Panel>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return { props: { session: await getSession(ctx) } };
}
