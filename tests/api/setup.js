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

  const numCurrentBuildings = await prisma.enghub_buildings.count();
  if (numCurrentBuildings === 0) {
    await prisma.enghub_buildings.create({
      data: { name: 'Test', id: 1, enghub_rooms: { createMany: { data: rooms } } }
    });
  } else {
    await prisma.enghub_rooms.createMany({ data: rooms.map(r => ({ ...r, building_id: 1 })) });
  }

  await prisma.enghub_bookings.createMany({
    data: bookings.map(b => ({
      id: b.id, room_id: b.roomId, datetime: b.datetime, email: b.email,
    }))
  });
};
