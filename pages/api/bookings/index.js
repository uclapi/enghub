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

  if (req.method === "GET") {
    if (req.query?.date == null) {
      return res.status(200).json({ bookings: null });
    }

    const start = new Date(req.query.date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCHours(23, 59, 59, 999);

    const bookings = await prisma.enghub_bookings.findMany({
      where: { datetime: { gte: start, lte: end } },
      include: {enghub_users: {select: {full_name: true}}},
    });

    const bookingsByRoom = bookings.reduce((acc, cur) => {
      const record = {
        id: cur.id,
        roomName: cur.room_name,
        datetime: cur.datetime,
        // Whether the booking belongs to the logged in user
        isOwner: session.user.email === cur.email,
        // Only select user details for admins
        fullName: session.user.isAdmin ? cur.enghub_users.full_name : null,
        email: session.user.isAdmin ? cur.email : null,
      };

      if (!acc[cur.room_name]) acc[cur.room_name] = [record];
      else acc[cur.room_name].push(record);

      return acc;
    }, {});

    return res.status(200).json({ bookings: bookingsByRoom });
  }

  if (req.method === "POST") {
    if (req.body?.datetime == null || req.body?.room_name == null) {
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

    const existingBookingsCount = await prisma.enghub_bookings.count({
      where: {
        datetime,
        room_name: req.body.room_name,
      }
    });

    if (existingBookingsCount !== 0) {
      return res.status(400).json({
        error: true,
        message: 'This slot is already booked. Please try booking another available slot.',
      });
    }

    // Non-admins can only book a certain number of minutes per week
    if (!session.user.isAdmin) {
      const { start: weekStart, end: weekEnd } =
        getWeekStartAndEndFromDate(datetime);

      const numBookingsThisWeek = await prisma.enghub_bookings.findMany({
        where: {
          datetime: {
            gte: weekStart,
            lte: weekEnd,
          },
          email: session.user.email,
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

    const query = await prisma.enghub_bookings.create({
      data: {
        datetime,
        email: session.user.email,
        room_name: req.body.room_name,
      },
    });

    return res.status(200).json({ error: false, datetime: req.body.datetime });
  }
}
