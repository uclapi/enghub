import Head from "next/head";
import Link from "next/link";
import { Button, Panel } from "rsuite";
import { MAX_MINUTES_BOOKABLE_PER_WEEK } from "../lib/constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>UCL Room Booking System</title>
        <meta
          name="description"
          content="Booking site for the UCL Engineering Hub (Henry Morley Building)"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to the UCL student room booking system!
        </h1>
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
        This system allows UCL students to book rooms that are specific to
        faculties, departments, or projects. There are currently 2 areas that
        can be booked on this system. <br />
        <p>Opening Hours: Mon - Fri (08:00 - 20:00).</p>
        <i>
          Note: students can book a maximum of {MAX_MINUTES_BOOKABLE_PER_WEEK}{" "}
          minutes per week.
        </i>
        <div className={styles.locations}>
          <div>
            <h3>
              Henry Morley Building <br />
              (UCL Engineering Hub)
            </h3>
            <p>
              This is open to all UCL Engineering students &amp; societies, with
              2 large social working spaces and 5 bookable group work rooms.
            </p>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1130.0058496573101!2d-0.131568525291402!3d51.5238625675464!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761bde3218721b%3A0xedc3e45afe9f9345!2sEngineering%20Science%20Student%20Hub!5e0!3m2!1sen!2sus!4v1641839269356!5m2!1sen!2sus"
              className={styles.map}
              loading="lazy"
            ></iframe>
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
          </div>
          <div>
            <h3>
              Roberts Building 105A <br />
              (UCL International Development Hub)
            </h3>
            <p>
              This is open to all students affiliated with the{" "}
              <a href="https://www.ucl.ac.uk/engineering/collaborate/ucl-international-development-hub-0">
                UCL International Development (ID) Hub
              </a>{" "}
              for events, discussions, or project work.
            </p>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.4748862414535!2d-0.13436608426228627!3d51.522849179637674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761b2f00009f9b%3A0xe494d26d80bb0ddd!2sRoberts%20Building%2C%20London%20WC1E%207JE!5e0!3m2!1sen!2suk!4v1668443936466!5m2!1sen!2suk"
              className={styles.map}
              loading="lazy"
            ></iframe>
            <p>
              You can find detailed directions{" "}
              <a
                href="http://www.ucl.ac.uk/maps/roberts-building"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </p>
          </div>
        </div>
      </Panel>
    </>
  );
}
