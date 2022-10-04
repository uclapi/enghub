import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/db";
import { catchErrorsFrom } from "../../../lib/serverHelpers";

export default catchErrorsFrom(async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "PUT") {
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: true,
        message: "You do not have permission to edit rooms.",
      });
    }

    const existingRoomCount = await prisma.enghub_rooms.count({
      where: { name: { equals: req.query.roomName } },
    });

    if (existingRoomCount !== 1) {
      await prisma.enghub_rooms.create({
        data: {
          name: req.query.roomName,
          capacity: req.body.capacity,
          admin_only: req.body.admin_only,
          active: false
        },
      });
      res.status(200).json({ error: false });
    }

    if (req.body?.capacity) {
      if (req.body?.capacity <= 0) {
        return res.status(422).json({
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

    if (typeof req.body?.admin_only !== 'undefined') {
      await prisma.enghub_rooms.update({
        where: { name: req.query.roomName },
        data: { admin_only: req.body.admin_only },
      });
    }

    return res.status(200).json({ error: false });
  }
});
