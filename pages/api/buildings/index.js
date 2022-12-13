import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/db";
import { catchErrorsFrom } from "../../../lib/serverHelpers";

export default catchErrorsFrom(async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "GET") {
    const buildings = await prisma.enghub_buildings.findMany({
      orderBy: [{ name: "desc" }],
    });

    return res.status(200).json({ buildings });
  }
});
