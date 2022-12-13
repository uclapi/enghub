import { getSession } from "next-auth/react";
import { prisma } from "../../../../lib/db";
import { catchErrorsFrom } from "../../../../lib/serverHelpers";

export default catchErrorsFrom(async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (!session.user.isAdmin) {
    return res.status(403).json({
      error: true,
      message: "You do not have permission to room user whitelists",
    });
  }

  if (req.method === "POST") {
    const room = await prisma.enghub_rooms.findFirst({
      where: { id: +req.query.roomId },
    });

    if (!room) {
      return res.status(422).json({
        error: true,
        message: "You provided an invalid room",
      });
    }

    if (!req.body.email) {
      return res.status(422).json({
        error: true,
        message: "You did not provide a valid email",
      });
    }

    await prisma.enghub_rooms_user_whitelist.create({
      data: { email: req.body.email, room_id: +req.query.roomId },
    });

    return res.status(200).json({ error: false });
  }

  if (req.method === "DELETE") {
    const room = await prisma.enghub_rooms.findFirst({
      where: { id: +req.query.roomId },
    });

    if (!room) {
      return res.status(422).json({
        error: true,
        message: "You provided an invalid room",
      });
    }

    if (!req.body.email) {
      return res.status(422).json({
        error: true,
        message: "You did not provide a valid email",
      });
    }

    await prisma.enghub_rooms_user_whitelist.delete({
      where: {
        email_room_id: {
          email: req.body.email,
          room_id: +req.query.roomId,
        },
      },
    });

    return res.status(200).json({ error: false });
  }
});
