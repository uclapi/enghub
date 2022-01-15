import { signIn } from "next-auth/react";
import { Button, Message } from "rsuite";

export default function LoginMessage() {
  return (
    <Message showIcon type="error" header="Please login to continue">
      <Button
        style={{ backgroundColor: "#ea1e59" }}
        appearance="primary"
        size="md"
        onClick={() => signIn("uclapi")}
      >
        Login
      </Button>
    </Message>
  );
}
