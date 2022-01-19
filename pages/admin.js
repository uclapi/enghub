import { getSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { Panel, Button, Form, Input, Loader, Message } from "rsuite";
import LoginMessage from "../components/LoginMessage.react";
import {
  addAdmin,
  updateRoomActiveState,
  updateRoomCapacity,
} from "../lib/api";
import { pushSuccessToast } from "../lib/helpers";
import styles from "../styles/Admin.module.css";
import EditIcon from "@rsuite/icons/Edit";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import { useRooms } from "../lib/hooks";

const EditRooms = () => {
  const { rooms, isLoading, isError, mutate } = useRooms();
  const [editingRoom, setEditingRoom] = useState(null);

  const EditCell = ({ room }) => {
    const [value, setValue] = useState(room.capacity);
    return (
      <>
        <Input
          className={styles.tableEditInput}
          value={value}
          type="number"
          min={1}
          onChange={(v) => setValue(+v)}
        />
        <CheckOutlineIcon
          className={styles.icon}
          onClick={() => {
            updateRoomCapacity(room.name, value).then(() => {
              setEditingRoom(null);
              mutate();
              pushSuccessToast("Room capacity updated successfully!");
            });
          }}
        />
        <CloseOutlineIcon
          className={styles.icon}
          onClick={() => setEditingRoom(null)}
        />
      </>
    );
  };

  const renderCapacityCell = (room) =>
    editingRoom?.room === room.name ? (
      <EditCell room={room} />
    ) : (
      <>
        {room.capacity}{" "}
        <EditIcon
          onClick={() => setEditingRoom({ room: room.name })}
          className={styles.icon}
        />
      </>
    );

  return (
    <>
      <h4>Manage Rooms</h4>
      <p>
        You can edit room capacities or mark rooms as inactive below.
        <br />
        <i>
          Note: marking a room as inactive will <strong>not</strong> delete
          existing bookings for this room, but will prevent new bookings from
          being made.
        </i>
      </p>

      {isLoading && <Loader content="Loading..." vertical />}

      {isError && (
        <Message type="error" showIcon className="error-message">
          There was an error loading the current rooms. Please try again later
          or contact us if the error persists.
        </Message>
      )}

      {!isLoading && !isError && (
        <table height={200} className={styles.roomsTable}>
          <tr>
            <th>Room Name</th>
            <th>Capacity</th>
            <th>Action</th>
          </tr>
          {rooms.map((room) => (
            <tr>
              <td>{room.name}</td>
              <td>{renderCapacityCell(room)}</td>
              <td>
                {room.active ? (
                  <Button
                    appearance="primary"
                    color="red"
                    onClick={() =>
                      updateRoomActiveState(room.name, false).then(() => {
                        pushSuccessToast("Room marked as inactive!");
                        mutate();
                      })
                    }
                  >
                    Mark as inactive?
                  </Button>
                ) : (
                  <Button
                    appearance="primary"
                    color="green"
                    onClick={() =>
                      updateRoomActiveState(room.name, true).then(() => {
                        pushSuccessToast("Room marked as active!");
                        mutate();
                      })
                    }
                  >
                    Mark as active?
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </table>
      )}
    </>
  );
};

const AddAdmins = () => {
  const [email, setEmail] = useState("");
  return (
    <>
      <h4>Manage Admins</h4>
      <p>
        To add an administrator to the system, please enter their UCL email
        address below. When they next login, they will be granted administrator
        privileges:
      </p>
      <br />
      <Form
        layout="inline"
        onSubmit={() => {
          addAdmin(email).then(() =>
            pushSuccessToast(
              "Administrator added successfully! This will take effect when they next login."
            )
          );
        }}
      >
        <Form.Group>
          <Form.Control
            name="email"
            required
            pattern=".+@ucl\.ac\.uk"
            value={email}
            onChange={setEmail}
            placeholder="e.g., j.doe@ucl.ac.uk"
            title="Please enter a valid UCL email address."
            type="email"
          />
        </Form.Group>
        <Button type="submit" appearance="primary">
          Add admin
        </Button>
      </Form>
    </>
  );
};

export default function Admin({ session }) {
  return (
    <>
      <Head>
        <title>Admin - UCL Engineering Hub</title>
      </Head>

      <Panel header={<h2>Administration</h2>} bordered className="card">
        {session ? (
          <>
            <AddAdmins />
            <EditRooms />
          </>
        ) : (
          <LoginMessage />
        )}
      </Panel>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return { props: { session: await getSession(ctx) } };
}
