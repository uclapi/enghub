import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/db";
import { catchErrorsFrom } from "../../../lib/serverHelpers";

export default catchErrorsFrom(async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "GET") {
    if (!req.query.buildingId) {
      return res.status(422).json({
        error: true,
        message: "You did not provide valid details for the room",
      });
    }

    const rooms = session.user.isAdmin
      ? await prisma.enghub_rooms.findMany({
          orderBy: [{ active: "desc" }, { name: "desc" }],
          where: { building_id: { equals: +req.query.buildingId } },
        })
      : await prisma.enghub_rooms.findMany({
          where: {
            active: { equals: true },
            building_id: { equals: +req.query.buildingId },
          },
          orderBy: { name: "desc" },
        });

    // Return active rooms followed by admin-only rooms followed by inactive rooms
    rooms.sort((a, b) => a.admin_only - b.admin_only - (a.active - b.active));

    return res.status(200).json({ rooms });
  }

  if (req.method === "POST") {
    if (!req.body.name || !req.body.building_id) {
      return res.status(422).json({
        error: true,
        message: "You did not provide valid details for the new room",
      });
    }

    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: true,
        message: "You do not have permission to add new rooms to the system.",
      });
    }

    await prisma.enghub_rooms.create({
      data: {
        name: req.body.name,
        building_id: req.body.building_id,
        capacity: 0,
        admin_only: false,
        active: false,
        book_by_seat: true,
      },
    });

    res.status(200).json({ error: false });
  }
});
