-- CreateTable
CREATE TABLE "enghub_bookings" (
    "id" SERIAL NOT NULL,
    "datetime" TIMESTAMPTZ(6) NOT NULL,
    "room_name" VARCHAR(5) NOT NULL,
    "email" VARCHAR(100) NOT NULL,

    CONSTRAINT "enghub_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enghub_rooms" (
    "name" VARCHAR(6) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "enghub_rooms_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "enghub_users" (
    "email" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "enghub_users_pkey" PRIMARY KEY ("email")
);

-- AddForeignKey
ALTER TABLE "enghub_bookings" ADD CONSTRAINT "enghub_bookings_email_fkey" FOREIGN KEY ("email") REFERENCES "enghub_users"("email") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "enghub_bookings" ADD CONSTRAINT "enghub_bookings_room_name_fkey" FOREIGN KEY ("room_name") REFERENCES "enghub_rooms"("name") ON DELETE NO ACTION ON UPDATE NO ACTION;
