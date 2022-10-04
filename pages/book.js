import InfoOutlineIcon from "@rsuite/icons/InfoOutline";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { Modal, Panel } from "rsuite";
import LoginMessage from "../components/LoginMessage.react";
import Scheduler from "../components/Scheduler.react";
import styles from "../styles/Book.module.css";

export default function Book({ session }) {
  const [showRoomLayout, setShowRoomLayout] = useState(false);

  return (
    <>
      <Head>
        <title>Room Booking - UCL Engineering Hub</title>
      </Head>

      <Modal
        size='full'
        style={{height: "80%"}}
        open={showRoomLayout}
        onClose={() => setShowRoomLayout(false)}
      >
        <Modal.Header>
          <Modal.Title>Room Layout and Capacities</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img width="100%" src="/EngHubLayout.jpg" />
        </Modal.Body>
      </Modal>

      <Panel
        className="card"
        bordered
        header={
          <>
            <h2>Book a Room</h2>
            <div
              className={styles.showRoomLayout}
              onClick={() => setShowRoomLayout(true)}
            >
              <InfoOutlineIcon /> Show Room Layout?
            </div>
          </>
        }
      >
        {session ? <Scheduler session={session} /> : <LoginMessage />}
      </Panel>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return { props: { session: await getSession(ctx) } };
}
