import { getSession } from "next-auth/react";
import {
  BOOKING_LENGTH,
  MAX_DAYS_IN_ADVANCE_BOOKABLE,
  MAX_MINUTES_BOOKABLE_PER_WEEK,
} from "../../../lib/constants";
import { prisma } from "../../../lib/db";
import {
  addDaysToDate,
  getStartHourOfDate,
  getWeekStartAndEndFromDate,
} from "../../../lib/helpers";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "DELETE") {
    if (req.query.bookingId == null) {
      return res.status(400).json({
        error: true,
        message: "You did not provide a valid booking to cancel",
      });
    }

    const bookingExistsForUser = await prisma.enghub_bookings.findFirst({
      where: {
        email: { equals: session.user.email },
        id: { equals: +req.query.bookingId },
      },
    });

    if (bookingExistsForUser == null) {
      return res.status(400).json({
        error: true,
        message: "You did not provide a valid booking to cancel",
      });
    }

    if (new Date(bookingExistsForUser.datetime) <= new Date()) {
      return res.status(400).json({
        error: true,
        message: "You cannot cancel bookings from the past",
      });
    }

    await prisma.enghub_bookings.delete({
      where: { id: +req.query.bookingId },
    });

    return res.status(200).json({ error: false });
  }
}
