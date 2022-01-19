import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { Button, Panel } from "rsuite";
import { MAX_MINUTES_BOOKABLE_PER_WEEK } from "../lib/constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>UCL Engineering Hub</title>
        <meta
          name="description"
          content="Booking site for the UCL Engineering Hub (Henry Morley Building)"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to the UCL Engineering Hub!</h1>
        <Link href="/book">
          <Button
            style={{ backgroundColor: "#ea1e59" }}
            appearance="primary"
            size="lg"
          >
            Book a room now &rarr;
          </Button>
        </Link>
      </main>

      <Panel bordered className={styles.about}>
        The Engineering Hub is a new student hub that opened in October 2016
        located in the Henry Morley Building. The space is opened to all
        students in Undergraduate Engineering and members of Engineering-related
        student societies. The Hub includes 2 large social working spaces and 5
        bookable group work rooms.
        <br />
        <i>
          Note: students can book a maximum of {MAX_MINUTES_BOOKABLE_PER_WEEK}{" "}
          minutes per week.
        </i>

        <h3>Opening Times</h3>
        Mon - Fri: 08:00 - 22:00
        <br />
        Sat - Sun: 09:00 - 19:00

        <h3>Map</h3>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1130.0058496573101!2d-0.131568525291402!3d51.5238625675464!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761bde3218721b%3A0xedc3e45afe9f9345!2sEngineering%20Science%20Student%20Hub!5e0!3m2!1sen!2sus!4v1641839269356!5m2!1sen!2sus"
          className={styles.map}
          loading="lazy"
        ></iframe>

        <h3>Directions</h3>
        <p>
          You can find detailed directions{" "}
          <a
            href="http://www.ucl.ac.uk/maps/henry-morley-building"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
      </Panel>
    </>
  );
}
