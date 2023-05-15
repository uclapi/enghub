import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/db";
import { catchErrorsFrom } from "../../../lib/serverHelpers";

export default catchErrorsFrom(async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "GET") {
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: true,
        message: "You do not have permission to view individual rooms.",
      });
    }

    const room = await prisma.enghub_rooms.findMany({
      orderBy: [{ active: "desc" }, { name: "desc" }],
      where: { id: { equals: +req.query.roomId } },
    });

    return room;
  }

  if (req.method === "PUT") {
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: true,
        message: "You do not have permission to edit rooms.",
      });
    }

    const existingRoomCount = await prisma.enghub_rooms.count({
      where: { id: { equals: +req.query.roomId } },
    });

    if (existingRoomCount !== 1) {
      return res.status(422).json({
        error: true,
        message: "You did not provide a valid room",
      });
    }

    if (req.body?.capacity) {
      if (req.body?.capacity <= 0) {
        return res.status(422).json({
          error: true,
          message: "You did not provide a valid capacity",
        });
      }

      await prisma.enghub_rooms.update({
        where: { id: +req.query.roomId },
        data: { capacity: req.body.capacity },
      });
    }

    const fields = [
      "active",
      "book_by_seat",
      "restricted_to_groups",
      "admin_only",
      "description",
    ];

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];

      if (typeof req.body?.[field] !== "undefined") {
        await prisma.enghub_rooms.update({
          where: { id: +req.query.roomId },
          data: { [field]: req.body[field] === "" ? null : req.body[field] },
        });
      }
    }

    return res.status(200).json({ error: false });
  }
});
