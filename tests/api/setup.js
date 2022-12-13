import { PrismaClient } from "@prisma/client";
import { rooms, users, bookings } from "./test_helpers";

const prisma = new PrismaClient();
export default async () => {
  await prisma.enghub_users.createMany({
    data: Object.values(users).map(u => ({
      full_name: u.fullName,
      email: u.email,
      is_admin: u.isAdmin,
    }))
  });

  await prisma.enghub_rooms.createMany({ data: rooms });

  await prisma.enghub_bookings.createMany({
    data: bookings.map(b => ({
      id: b.id, room_name: b.roomName, datetime: b.datetime, email: b.email,
    }))
  });
};
