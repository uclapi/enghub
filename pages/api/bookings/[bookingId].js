import { getServerAuthSession } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/db";
import { catchErrorsFrom } from "../../../lib/serverHelpers";

export default catchErrorsFrom(async (req, res) => {
  const session = await getServerAuthSession({ req, res });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "DELETE") {
    if (req.query.bookingId == null) {
      return res.status(404).json({
        error: true,
        message: "You did not provide a valid booking to cancel",
      });
    }

    const bookingExistsForUser = await prisma.enghub_bookings.findFirst({
      where: {
        email: { equals: session.user.email },
        id: { equals: req.query.bookingId },
      },
    });

    if (bookingExistsForUser == null) {
      return res.status(422).json({
        error: true,
        message: "You did not provide a valid booking to cancel",
      });
    }

    if (new Date(bookingExistsForUser.datetime) <= new Date()) {
      return res.status(422).json({
        error: true,
        message: "You cannot cancel bookings from the past",
      });
    }

    await prisma.enghub_bookings.delete({
      where: { id: req.query.bookingId },
    });

    return res.status(200).json({ error: false });
  }
});
