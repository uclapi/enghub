import InfoOutlineIcon from "@rsuite/icons/InfoOutline";
import { getServerAuthSession } from "./api/auth/[...nextauth]";
import Head from "next/head";
import { useState } from "react";
import { Message, Modal, Panel, SelectPicker } from "rsuite";
import LoginMessage from "../components/LoginMessage.react";
import Scheduler from "../components/Scheduler.react";
import { useBuildings } from "../lib/hooks";
import styles from "../styles/Book.module.css";

export default function Book({ session }) {
  const [showRoomLayout, setShowRoomLayout] = useState(false);
  const { buildings } = useBuildings();
  const [buildingId, setBuildingId] = useState(null);

  return (
    <>
      <Head>
        <title>Room Booking - UCL Engineering Hub</title>
      </Head>

      <Modal
        size="full"
        style={{ height: "80%" }}
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
            <h2 className={styles.header}>
              Book a Room
              <SelectPicker
                value={buildingId}
                label="Building"
                cleanable={false}
                data={buildings.map((b) => ({ label: b.name, value: b.id }))}
                onChange={(id) => setBuildingId(id)}
              />
            </h2>

            {buildingId === 1 && (
              <div
                className={styles.showRoomLayout}
                onClick={() => setShowRoomLayout(true)}
              >
                <InfoOutlineIcon /> Show Room Layout?
              </div>
            )}
          </>
        }
      >
        {session ? (
          buildingId === null ? (
            <Message type="info">
              Please choose a building using the selector to book a room.
            </Message>
          ) : (
            <Scheduler buildingId={buildingId} session={session} />
          )
        ) : (
          <LoginMessage />
        )}
      </Panel>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return { props: { session: await getServerAuthSession(ctx) } };
}
