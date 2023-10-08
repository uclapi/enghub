import { getServerAuthSession } from "../auth/[...nextauth]";
import {
  BOOKING_ID_ALPHABET,
  BOOKING_ID_LENGTH,
  BOOKING_LENGTH,
  MAX_DAYS_IN_ADVANCE_BOOKABLE,
  MAX_MINUTES_BOOKABLE_PER_WEEK,
  WEEKDAY_SLOTS,
  WEEKEND_SLOTS,
} from "../../../lib/constants";
import { prisma } from "../../../lib/db";
import {
  getLatestDateBookableByNonAdmins,
  getStartHourOfDate,
  getToday,
  getWeekStartAndEndFromDate,
} from "../../../lib/helpers";
import { catchErrorsFrom } from "../../../lib/serverHelpers";
import sgMail from "@sendgrid/mail";
import { createEvent } from "ics";
import { customAlphabet } from "nanoid";

export default catchErrorsFrom(async (req, res) => {
  const session = await getServerAuthSession({ req, res });
  if (!session) {
    return res.redirect("/");
  }

  if (req.method === "GET") {
    if (req.query?.date == null) {
      return res
        .status(422)
        .json({ error: true, message: "You did not provide a date filter." });
    }

    if (!req.query.buildingId) {
      return res.status(422).json({
        error: true,
        message: "You did not provide a building filter.",
      });
    }

    const today = getToday();
    const start = new Date(req.query.date);
    const end = new Date(start);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    if (
      !session.user.isAdmin &&
      (start < today || end > getLatestDateBookableByNonAdmins())
    ) {
      return res.status(403).json({
        error: true,
        message: "You do not have permission to view bookings for this day.",
      });
    }

    const bookings = await prisma.enghub_bookings.findMany({
      where: {
        datetime: { gte: start, lte: end },
        enghub_rooms: { building_id: { equals: +req.query.buildingId } },
      },
      include: {
        enghub_users: { select: { full_name: true } },
        enghub_rooms: { select: { name: true } },
      },
    });

    const bookingsByRoom = bookings.reduce((acc, cur) => {
      const record = {
        id: cur.id,
        roomName: cur.enghub_rooms.name,
        roomId: cur.room_id,
        datetime: cur.datetime,
        // Whether the booking belongs to the logged in user
        isOwner: session.user.email === cur.email,
        // Only select user details for admins
        fullName: session.user.isAdmin ? cur.enghub_users.full_name : null,
        email: session.user.isAdmin ? cur.email : null,
      };

      if (!acc[cur.room_id]) acc[cur.room_id] = [record];
      else acc[cur.room_id].push(record);

      return acc;
    }, {});

    return res.status(200).json({ bookings: bookingsByRoom });
  }

  if (req.method === "POST") {
    if (req.body?.datetime == null || req.body?.room_id == null) {
      return res.status(422).json({
        error: true,
        message: "You did not provide a valid date/time/room for the booking",
      });
    }

    const datetime = new Date(req.body.datetime);
    datetime.setSeconds(0, 0);

    if (datetime < getStartHourOfDate(new Date())) {
      return res.status(422).json({
        error: true,
        message: "You cannot book a room in the past",
      });
    }

    const slots = datetime.getDay() % 6 == 0 ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
    if (slots.indexOf(datetime.toTimeString().substr(0, 5)) == -1) {
      return res.status(422).json({
        error: true,
        message: "You did not provide a valid date/time for the booking",
      });
    }

    const room = await prisma.enghub_rooms.findFirst({
      where: { id: req.body.room_id, active: true },
      include: { enghub_buildings: { select: { name: true } } },
    });

    if (!room) {
      return res.status(422).json({
        error: true,
        message: "You provided an invalid room",
      });
    }

    let allowedToBookRoom = false;
    if (session.user.isAdmin) {
      allowedToBookRoom = true;
    } else if (!room.admin_only) {
      if (
        !room.restricted_to_groups.length ||
        room.restricted_to_groups.some((g) =>
          session.user.uclGroups.includes(g)
        )
      ) {
        allowedToBookRoom = true;
      }
    }

    if (!allowedToBookRoom) {
      return res.status(403).json({
        error: true,
        message: "You do not have permission to book this room",
      });
    }

    const existingBookings = await prisma.enghub_bookings.findMany({
      where: { datetime, room_id: req.body.room_id },
      select: { enghub_users: { select: { email: true } } },
    });

    if (
      (room.book_by_seat && existingBookings.length >= room.capacity) ||
      (!room.book_by_seat && existingBookings.length > 0) ||
      existingBookings.find((b) => b.enghub_users.email === session.user.email)
    ) {
      return res.status(403).json({
        error: true,
        message:
          "This slot is already booked. Please try booking another available slot.",
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
        return res.status(403).json({
          error: true,
          message:
            "You have reached your bookable minutes this week. Please try again next week or cancel an existing upcoming booking for this week.",
        });
      }
    }

    // Non-admins can only book a certain number of days in advance
    if (
      !session.user.isAdmin &&
      datetime > getLatestDateBookableByNonAdmins()
    ) {
      return res.status(403).json({
        error: true,
        message: `You can only book up to ${MAX_DAYS_IN_ADVANCE_BOOKABLE} days in advance.`,
      });
    }

    const newBookingId = customAlphabet(
      BOOKING_ID_ALPHABET,
      BOOKING_ID_LENGTH
    )();
    const shortBookingId = newBookingId.substring(0, 5);
    const query = await prisma.enghub_bookings.create({
      data: {
        id: newBookingId,
        datetime,
        email: session.user.email,
        room_id: req.body.room_id,
      },
    });

    // Send an email to the user that their room has been booked
    if (process.env.SENDGRID_SECRET && !session.user.isAdmin) {
      try {
        const event = {
          start: [
            datetime.getFullYear(),
            datetime.getMonth() + 1,
            datetime.getDay() - 1,
            datetime.getHours(),
            0,
          ],
          duration: { hours: 1 },
          title: `${room.enghub_buildings.name} ${room.name}`,
          description: `Booking confirmation number: ${shortBookingId}`,
          location: `${room.enghub_buildings.name}, ${room.name}, UCL`,
          url: "https://enghub.io",
          geo: { lat: 51.523859, lon: -0.131974 },
          status: "CONFIRMED",
          busyStatus: "BUSY",
        };

        const { value } = createEvent(event);

        sgMail.setApiKey(process.env.SENDGRID_SECRET);
        await sgMail.send({
          to: session.user.email,
          from: {
            email: "rooms@enghub.io",
            name: "Enghub",
          },
          templateId: "d-d02d6b45251f43b9867bfbe0324759b7",
          dynamicTemplateData: {
            first_name: session.user.name.split(" ")[0],
            room: room.name,
            time: new Intl.DateTimeFormat("en-GB", {
              timeStyle: "short",
              timeZone: "Europe/London",
            }).format(datetime),
            date: new Intl.DateTimeFormat("en-GB", {
              timeZone: "Europe/London",
            }).format(datetime),
            date_long: new Intl.DateTimeFormat("en-GB", {
              dateStyle: "full",
              timeZone: "Europe/London",
            }).format(datetime),
            time_long: new Intl.DateTimeFormat("en-GB", {
              hour: "numeric",
              hourCycle: "h12",
              minute: "2-digit",
              timeZone: "Europe/London",
            }).format(datetime),
            booking_number: shortBookingId,
          },
          attachments: [
            {
              content: Buffer.from(value).toString("base64"),
              type: "application/ics",
              name: "invite.ics",
              filename: "invite.ics",
              disposition: "attachment",
            },
          ],
        });
      } catch (error) {
        console.error("Failed to send confirmation email", error);
      }
    }

    return res.status(200).json({ error: false, datetime: req.body.datetime });
  }
});
