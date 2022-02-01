/*
  Warnings:

  - The primary key for the `enghub_bookings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `enghub_bookings` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `VarChar(5)`.

*/
-- AlterTable
ALTER TABLE "enghub_bookings" DROP CONSTRAINT "enghub_bookings_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(20),
ADD CONSTRAINT "enghub_bookings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "enghub_bookings_id_seq";
