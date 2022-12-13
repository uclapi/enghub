/*
  Warnings:

  - You are about to drop the column `room_name` on the `enghub_bookings` table. All the data in the column will be lost.
  - The primary key for the `enghub_rooms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `room_id` to the `enghub_bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `building_id` to the `enghub_rooms` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "enghub_bookings" DROP CONSTRAINT "enghub_bookings_room_name_fkey";

-- Manual edits
ALTER TABLE "enghub_bookings" ADD COLUMN "room_id" INTEGER;

-- AlterTable
ALTER TABLE "enghub_rooms" DROP CONSTRAINT "enghub_rooms_pkey",
ADD COLUMN     "book_by_seat" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "building_id" INTEGER,
ADD COLUMN     "description" VARCHAR(200),
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "restricted_to_group" VARCHAR(20),
ADD CONSTRAINT "enghub_rooms_pkey" PRIMARY KEY ("id");

-- Manual edits
UPDATE "enghub_bookings" B SET room_id = (SELECT id FROM "enghub_rooms" WHERE name = B.room_name);

-- AlterTable
ALTER TABLE "enghub_bookings" DROP COLUMN "room_name";

-- CreateTable
CREATE TABLE "enghub_buildings" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "enghub_buildings_pkey" PRIMARY KEY ("id")
);

-- Manual edits
INSERT INTO "enghub_buildings" (id, name) VALUES (1, 'Henry Morley Building');
UPDATE "enghub_rooms" SET building_id = 1;
UPDATE "enghub_rooms" SET book_by_seat = 'f';
UPDATE "enghub_rooms" SET restricted_to_group = 'engscifac-all';

-- CreateTable
CREATE TABLE "enghub_rooms_user_whitelist" (
    "email" VARCHAR(100) NOT NULL,
    "room_id" INTEGER NOT NULL,

    CONSTRAINT "enghub_rooms_user_whitelist_pkey" PRIMARY KEY ("email","room_id")
);

-- AddForeignKey
ALTER TABLE "enghub_bookings" ADD CONSTRAINT "enghub_bookings_room_name_fkey" FOREIGN KEY ("room_id") REFERENCES "enghub_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "enghub_rooms" ADD CONSTRAINT "enghub_rooms_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "enghub_buildings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "enghub_rooms_user_whitelist" ADD CONSTRAINT "enghub_rooms_user_whitelist_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "enghub_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Manual edits
ALTER TABLE "enghub_bookings" ALTER COLUMN "room_id" SET NOT NULL;
ALTER TABLE "enghub_rooms" ALTER COLUMN "building_id" SET NOT NULL;
