import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default async () => {
  await prisma.enghub_rooms_user_whitelist.deleteMany();
  await prisma.enghub_bookings.deleteMany();
  await prisma.enghub_rooms.deleteMany();
  await prisma.enghub_users.deleteMany();
  await prisma.enghub_buildings.deleteMany();
  await prisma.$disconnect();
};
