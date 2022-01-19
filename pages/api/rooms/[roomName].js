import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/db";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "PUT") {
    if (!session.user.isAdmin) {
      return res.status(400).json({
        error: true,
        message: "You do not have permission to edit rooms",
      });
    }

    const existingRoomCount = await prisma.enghub_rooms.count({
      where: { name: { equals: req.query.roomName } },
    });

    if (existingRoomCount !== 1) {
      return res
        .status(400)
        .json({ error: true, message: "The provided room does not exist" });
    }

    if (req.body?.capacity) {
      if (req.body?.capacity <= 0) {
        return res
          .status(400)
          .json({
            error: true,
            message: "You did not provide a valid capacity",
          });
      }

      await prisma.enghub_rooms.update({
        where: { name: req.query.roomName },
        data: { capacity: req.body.capacity },
      });
    }

    if (req.body?.active === true || req.body?.active === false) {
      await prisma.enghub_rooms.update({
        where: { name: req.query.roomName },
        data: { active: req.body.active },
      });
    }

    return res.status(200).json({ error: false });
  }
}
