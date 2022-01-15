import { getSession } from "next-auth/react";
import { prisma } from "../../lib/db";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "GET") {
    const bookings = await prisma.bookings.findMany({
      where: { cn: { equals: session.user.id } },
      select: { datetime: true, room: true }, // Don't select user CN
    });

    return res.status(200).json({ bookings });
  }
}
