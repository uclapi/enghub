import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Loader,
  Message,
  Modal,
  SelectPicker,
  Toggle,
} from "rsuite";
import { useBuildings, useRooms } from "../lib/hooks";
import styles from "../styles/ManageRooms.module.css";
import EditIcon from "@rsuite/icons/Edit";
import { TagInput } from "rsuite";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import { addRoom, updateRoom } from "../lib/api";
import { pushSuccessToast } from "../lib/helpers";

function AdminRoom({ room, handleManageRoom }) {
  let style = room.active ? styles.active : styles.inactive;
  if (room.admin_only) style = styles.adminOnly;

  let status = "";
  if (!room.active) status = "inactive";
  else if (room.admin_only) status = "admin-only";
  else if (room.book_by_seat) status = "individual seats bookable";
  else status = "entire room bookable";

  return (
    <div className={`${styles.room} ${style}`}>
      <div className={styles.roomName}>{room.name}</div>
      <p className={styles.roomDetails}>
        Capacity: {room.capacity}
        <br />
        Status: {status}
        <br />
        {!!room.restricted_to_groups.length &&
          `Groups: ${room.restricted_to_groups.join(", ")}`}
      </p>

      <Button color="primary" size="xs" onClick={() => handleManageRoom()}>
        Manage room
      </Button>
    </div>
  );
}

function EditCell({ initialValue, type, onSubmit, onCancel }) {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <Input
        className={styles.editInput}
        value={value}
        type={type}
        onChange={(v) => setValue(v)}
      />
      <CheckOutlineIcon
        className={styles.icon}
        onClick={() => onSubmit(value)}
      />
      <CloseOutlineIcon className={styles.icon} onClick={() => onCancel()} />
    </>
  );
}

function EditRoom({ room, mutate }) {
  const [editCapacity, setEditCapacity] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [editGroup, setEditGroup] = useState(false);

  if (!room) return null;

  return (
    <div>
      <p>
        Room Status:{" "}
        <Toggle
          checked={room.active}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(active) => {
            updateRoom(room.id, { active }).then(() => {
              mutate();
              pushSuccessToast("Room status updated successfully!");
            });
          }}
        />
      </p>
      <p>
        Admin-only:{" "}
        <Toggle
          checked={room.admin_only}
          checkedChildren="Yes"
          unCheckedChildren="No"
          onChange={(adminOnly) => {
            updateRoom(room.id, { adminOnly }).then(() => {
              mutate();
              pushSuccessToast("Room admin-only status updated successfully!");
            });
          }}
        />
      </p>
      <p>
        Booking mode (seats or room):{" "}
        <Toggle
          checked={room.book_by_seat}
          checkedChildren="Book individual seats"
          unCheckedChildren="Book entire room"
          onChange={(bookBySeat) => {
            updateRoom(room.id, { bookBySeat }).then(() => {
              mutate();
              pushSuccessToast("Room booking mode updated successfully!");
            });
          }}
        />
      </p>
      <p>
        Room Capacity:{" "}
        {editCapacity ? (
          <EditCell
            type="number"
            initialValue={room.capacity}
            onCancel={() => setEditCapacity(false)}
            onSubmit={(capacity) => {
              updateRoom(room.id, { capacity: +capacity }).then(() => {
                setEditCapacity(false);
                mutate();
                pushSuccessToast("Room capacity updated successfully!");
              });
            }}
          />
        ) : (
          <>
            {room.capacity}{" "}
            <EditIcon
              onClick={() => setEditCapacity(true)}
              className={styles.icon}
            />
          </>
        )}
      </p>
      <p>
        Description:{" "}
        {editDescription ? (
          <EditCell
            type="text"
            initialValue={room.description}
            onCancel={() => setEditDescription(false)}
            onSubmit={(description) => {
              updateRoom(room.id, { description }).then(() => {
                setEditDescription(false);
                mutate();
                pushSuccessToast("Room description updated successfully!");
              });
            }}
          />
        ) : (
          <>
            {room.description ?? "N/A"}{" "}
            <EditIcon
              onClick={() => setEditDescription(true)}
              className={styles.icon}
            />
          </>
        )}
      </p>
      <p>
        Only allow user groups:{" "}
        <TagInput
          value={room.restricted_to_groups}
          block
          trigger={["Enter", "Space", "Comma"]}
          onChange={(groups) => {
            updateRoom(room.id, { groups }).then(() => {
              mutate();
              pushSuccessToast("Room user group updated successfully!");
            });
          }}
        />
      </p>
    </div>
  );
}

export default function ManageRooms({ session }) {
  const { buildings, isLoading, isError } = useBuildings();
  const [buildingId, setBuildingId] = useState(1);
  const {
    rooms,
    mutate: mutateRooms,
    isLoading: isLoadingRooms,
    isError: isErrorRooms,
  } = useRooms(buildingId);
  const [editRoomId, setEditRoomId] = useState(null);
  const editRoom =
    editRoomId === null ? null : rooms.find((r) => r.id === editRoomId);

  return (
    <>
      <h4>Manage Rooms</h4>

      {(isLoading || isLoadingRooms) && (
        <Loader backdrop content="Loading..." vertical />
      )}

      {(isError || isErrorRooms) && (
        <Message type="error" showIcon className="error-message">
          There was an error loading the buildings. Please try again later or
          contact us if the error persists.
        </Message>
      )}

      <Modal
        size="sm"
        style={{ height: "80%" }}
        open={editRoomId !== null}
        onClose={() => setEditRoomId(null)}
      >
        <Modal.Header>
          <Modal.Title>Edit Room: {editRoom?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditRoom room={editRoom} mutate={mutateRooms} />
        </Modal.Body>
      </Modal>

      <SelectPicker
        value={buildingId}
        label="Building"
        cleanable={false}
        data={buildings.map((b) => ({ label: b.name, value: b.id }))}
        onChange={(id) => setBuildingId(id)}
      />

      <div className={styles.roomList}>
        {rooms?.map((room) => (
          <AdminRoom
            room={room}
            handleManageRoom={() => setEditRoomId(room.id)}
          />
        ))}
      </div>

      {buildingId !== null && (
        <Button
          appearance="primary"
          onClick={async () => {
            const roomName = window.prompt(
              "Please enter the room name (this cannot be changed!)"
            );
            await addRoom(buildingId, roomName).then(() => {
              mutateRooms();
              pushSuccessToast(
                "Room added successfully! Please update its details now"
              );
            });
          }}
        >
          Add room?
        </Button>
      )}
    </>
  );
}
