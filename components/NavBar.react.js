import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function NavBar() {
  const { data: session } = useSession();

  if (session) {
    return (
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/book">Book a Room</Link>
          </li>
          <li>
            <Link href="/my_bookings">My Bookings</Link>
          </li>
          <li className="right">
            <span onClick={() => signOut()}>Logout</span>
          </li>
        </ul>
      </nav>
    );
  } else {
    return (
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li className="right">
            <span onClick={() => signIn("uclapi")}>Login</span>
          </li>
        </ul>
      </nav>
    );
  }
}
