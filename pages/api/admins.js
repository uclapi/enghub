import { getSession } from "next-auth/react";
import { prisma } from "../../lib/db";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "POST") {
    if (!session.user.isAdmin) {
      return res.status(400).json({
        error: true,
        message: "Only administrators can add new administrators to the system",
      });
    }

    if (!req.body.email && !req.body.email.endWith("@ucl.ac.uk")) {
      return res.status(400).json({
        error: true,
        message: "You did not provide a valid UCL email address.",
      });
    }

    const result = await prisma.enghub_users.upsert({
      create: { email: req.body.email, is_admin: true, full_name: '(pending)' },
      update: { is_admin: true },
      where: { email: req.body.email },
    });

    return res.status(200).json({ error: false });
  }
}
