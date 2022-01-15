import { confirm } from "@rsuite/interactions";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { Button, Loader, Message, Panel } from "rsuite";
import useSWR from "swr";
import LoginMessage from "../components/LoginMessage.react";
import { MAX_MINUTES_BOOKABLE_PER_WEEK } from "../lib/constants";
import { fetcher, getDateTimeString, pushErrorToast } from "../lib/helpers";

const useMyBookings = () => {
  const { data, error, mutate } = useSWR(`/api/my_bookings`, fetcher);
  return {
    bookings: data ? data.bookings : [],
    isLoading: !error && !data,
    isError: error || data?.error,
    mutate,
  };
};

const cancelBooking = async (datetime, room) => {
  return await fetch("/api/bookings", {
    method: "DELETE",
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

export default function Book({ session }) {
  const { bookings, isLoading, isError, mutate } = useMyBookings();

  const renderBookings = (bookings) => {
    const now = new Date();
    const [past, future] = bookings.reduce(
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

    return (
      <>
        <h3>Future Bookings</h3>
        {!future.length && <p>No bookings</p>}
        <ul className="my_bookings">
          {future.map((b) => (
            <li>
              {getDateTimeString(new Date(b.datetime))}
              {" "}
              - Room {b.room}.{" "}
              <Button
                color="red"
                appearance="ghost"
                onClick={async () => {
                  if (
                    await confirm(
                      "Are you sure you want to cancel this booking?",
                      {
                        okButtonText: "Yes",
                        cancelButtonText: "No",
                      }
                    )
                  ) {
                    await cancelBooking(b.datetime, b.room); // TODO: should we just give bookings an ID instead?
                    mutate();
                  }
                }}
              >
                Cancel?
              </Button>
            </li>
          ))}
        </ul>

        <h3>Past bookings</h3>
        {!past.length && <p>No bookings</p>}
        <ul className="my_bookings">
          {past.map((b) => (
            <li>
              {getDateTimeString(new Date(b.datetime))}
              {" "}
              - Room {b.room}.{" "}
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>My Bookings - UCL Engineering Hub</title>
      </Head>

      <Panel header={<h2>Your Bookings</h2>} bordered className="card">
        {!session.user.isAdmin && (
          <p>
            Please note that you can only book a maximum of{" "}
            {MAX_MINUTES_BOOKABLE_PER_WEEK} minutes per week.
          </p>
        )}

        {session ? (
          isLoading ? (
            <Loader backdrop content="Loading..." vertical />
          ) : isError ? (
            <Message type="error" showIcon className="error-message">
              There was an error loading the slots. Please try again later or
              contact us if the error persists.
            </Message>
          ) : (
            renderBookings(bookings)
          )
        ) : (
          <LoginMessage />
        )}
      </Panel>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      session: await getSession(ctx),
    },
  };
}
