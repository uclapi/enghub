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
      select: {
        // Don't select user email
        datetime: true,
        room_id: true,
        id: true,
        enghub_rooms: {
          select: { name: true, enghub_buildings: { select: { name: true } } },
        },
      },
      orderBy: [{ datetime: "asc" }], // Most recent first
    });

    return res.status(200).json({
      bookings: bookings.map((b) => {
        b.room_name = b.enghub_rooms.name;
        b.building_name = b.enghub_rooms.enghub_buildings.name;
        delete b.enghub_rooms;
        return b;
      }),
    });
  }
});
