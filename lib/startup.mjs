// This script runs on startup as sadly Next.JS does not have a nice way of doing it
// Writing scripts

import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
const prisma = new PrismaClient();

const defaultAdmin = async () => {
    if (process.env.DEFAULT_ADMIN) {
        try {
            await prisma.enghub_users.upsert({
              create: {
                email: process.env.DEFAULT_ADMIN,
                is_admin: true,
                full_name: "(pending)",
              },
              update: { is_admin: true },
              where: { email: process.env.DEFAULT_ADMIN },
            });
            console.log(`Set ${process.env.DEFAULT_ADMIN} as the default admin`)
          } catch (err) {
            console.error(`Failed to set ${process.env.DEFAULT_ADMIN} as the default admin`, err);
          }
    }
}

defaultAdmin();