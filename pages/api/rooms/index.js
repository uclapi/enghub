import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/db";
import { catchErrorsFrom } from "../../../lib/serverHelpers";

export default catchErrorsFrom(async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "GET") {
    const rooms = session.user.isAdmin
      ? await prisma.enghub_rooms.findMany({
        orderBy: [{ active: "desc" }, { name: "desc" }],
      })
      : await prisma.enghub_rooms.findMany({
        where: { active: { equals: true } },
        orderBy: { name: "desc" },
      });

    return res.status(200).json({ rooms });
  }
});
