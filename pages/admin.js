import Head from "next/head";
import { useState } from "react";
import { Panel, Button, Form, Input } from "rsuite";
import LoginMessage from "../components/LoginMessage.react";
import { getServerAuthSession } from "./api/auth/[...nextauth]";
import { addAdmin, updateRoom } from "../lib/api";
import { pushErrorToast, pushSuccessToast } from "../lib/helpers";
import { useRooms } from "../lib/hooks";
import ManageRooms from "../components/ManageRooms";
import styles from "../styles/Admin.module.css";

const AddAdmins = () => {
  const [email, setEmail] = useState("");
  return (
    <>
      <h4>Manage Admins</h4>
      <p>
        Administrators (usually staff) can see all booking details, book any
        room on the system with unlimited hours, and can book any slot in the
        future.
      </p>
      <p>
        To add an administrator to the system, please enter their UCL
        short-email address below. When they next login, they will be granted
        administrator privileges:
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
            placeholder="e.g., zxxxxxx@ucl.ac.uk"
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
        {session?.user?.isAdmin ? (
          <>
            <AddAdmins />
            <ManageRooms />
          </>
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
