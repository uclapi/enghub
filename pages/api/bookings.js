import { getSession } from "next-auth/react";
import {
  BOOKING_LENGTH,
  MAX_DAYS_IN_ADVANCE_BOOKABLE,
  MAX_MINUTES_BOOKABLE_PER_WEEK,
} from "../../lib/constants";
import { prisma } from "../../lib/db";
import {
  addDaysToDate,
  getStartHourOfDate,
  getWeekStartAndEndFromDate,
} from "../../lib/helpers";

const rooms = ["G02", "G03", "211", "212"];
export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "GET") {
    if (req.query?.date == null) {
      return res.status(200).json({ bookings: null });
    }

    const start = new Date(req.query.date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCHours(23, 59, 59, 999);

    const bookings = await prisma.bookings.findMany({
      where: { datetime: { gte: start, lte: end } },
    });

    const bookingsByRoom = bookings.reduce((acc, cur) => {
      const record = {
        datetime: cur.datetime,
        // Whether the booking belongs to the logged in user
        isOwner: session.user.id === cur.cn,
        // Only select user CN for admins
        cn: session.user.isAdmin ? cur.cn : null,
      };

      if (!acc[cur.room]) acc[cur.room] = [record];
      else acc[cur.room].push(record);

      return acc;
    }, {});

    return res.status(200).json({ bookings: bookingsByRoom });
  }

  if (req.method === "POST") {
    if (req.body?.datetime == null || req.body?.room == null) {
      return res.status(400).json({
        error: true,
        message: "You did not provide a valid date/time/room for the booking",
      });
    }

    const datetime = new Date(req.body.datetime);
    datetime.setSeconds(0, 0);

    if (datetime < getStartHourOfDate(new Date())) {
      return res.status(400).json({
        error: true,
        message: "You cannot book a room in the past",
      });
    }

    // Non-admins can only book a certain number of minutes per week
    if (!session.user.isAdmin) {
      const { start: weekStart, end: weekEnd } =
        getWeekStartAndEndFromDate(datetime);

      const numBookingsThisWeek = await prisma.bookings.findMany({
        where: {
          datetime: {
            gte: weekStart,
            lte: weekEnd,
          },
          cn: session.user.id,
        },
      });

      if (
        numBookingsThisWeek.length * BOOKING_LENGTH >=
        MAX_MINUTES_BOOKABLE_PER_WEEK
      ) {
        return res.status(400).json({
          error: true,
          message:
            "You have reached your bookable minutes this week. Please try again next week or cancel an existing upcoming booking for this week.",
        });
      }
    }

    // Non-admins can only book a certain number of days in advance
    if (
      !session.user.isAdmin &&
      datetime > addDaysToDate(new Date(), MAX_DAYS_IN_ADVANCE_BOOKABLE)
    ) {
      return res.status(400).json({
        error: true,
        message: `You can only book up to ${MAX_DAYS_IN_ADVANCE_BOOKABLE} days in advance.`,
      });
    }

    const query = await prisma.bookings.create({
      data: {
        datetime,
        cn: session.user.id,
        room: req.body.room,
      },
    });

    return res.status(200).json({ error: false, datetime: req.body.datetime });
  }

  if (req.method === "DELETE") {
    if (req.body?.datetime == null || req.body?.room == null) {
      return res.status(400).json({
        error: true,
        message: "You did not provide a valid booking to cancel",
      });
    }

    const datetime = new Date(req.body.datetime);

    const bookingExistsForUser = await prisma.bookings.findFirst({
      where: {
        cn: { equals: session.user.id },
        datetime: { equals: datetime },
        room: { equals: req.body.room },
      },
    });

    if (bookingExistsForUser == null) {
      return res.status(400).json({
        error: true,
        message: "You did not provide a valid booking to cancel",
      });
    }

    if (datetime <= new Date()) {
      return res.status(400).json({
        error: true,
        message: "You cannot cancel bookings from the past",
      });
    }

    await prisma.bookings.delete({
      where: {
        datetime_room: { datetime, room: req.body.room },
      },
    });

    return res.status(200).json({ error: false });
  }
}
