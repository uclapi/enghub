import { getSession } from "next-auth/react";
import { prisma } from "../../lib/db";
import { catchErrorsFrom } from "../../lib/serverHelpers";

export default catchErrorsFrom(async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "GET") {
    const bookings = await prisma.enghub_bookings.findMany({
      where: { email: { equals: session.user.email } },
      select: { datetime: true, room_name: true, id: true }, // Don't select user email
      orderBy: [{ datetime: "asc" }], // Most recent first
    });

    return res.status(200).json({ bookings });
  }
});
