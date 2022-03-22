import { getSession } from "next-auth/react";
import { prisma } from "../../lib/db";
import { catchErrorsFrom } from "../../lib/serverHelpers";

export default catchErrorsFrom(async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "POST") {
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: true,
        message:
          "You do not have permission to add new administrators to the system.",
      });
    }

    if (!req.body.email || !req.body.email.endsWith("@ucl.ac.uk")) {
      return res.status(422).json({
        error: true,
        message: "You did not provide a valid UCL email address.",
      });
    }

    try {
      await prisma.enghub_users.upsert({
        create: {
          email: req.body.email,
          is_admin: true,
          full_name: "(pending)",
        },
        update: { is_admin: true },
        where: { email: req.body.email },
      });
      return res.status(200).json({ error: false });
    } catch (err) {
      console.error("Failed to create new admin", err);
      return res
        .status(500)
        .json({
          error: true,
          message:
            "An unexpected error occurred. Please try again later or contact us if the error persists.",
        });
    }
  }
});
