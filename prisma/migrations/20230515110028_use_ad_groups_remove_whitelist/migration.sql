/*
  Warnings:

  - You are about to drop the column `restricted_to_group` on the `enghub_rooms` table. All the data in the column will be lost.
  - You are about to drop the `enghub_rooms_user_whitelist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "enghub_rooms_user_whitelist" DROP CONSTRAINT "enghub_rooms_user_whitelist_room_id_fkey";

-- AlterTable
ALTER TABLE "enghub_rooms" DROP COLUMN "restricted_to_group",
ADD COLUMN     "restricted_to_groups" TEXT[];

-- DropTable
DROP TABLE "enghub_rooms_user_whitelist";
