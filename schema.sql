CREATE TABLE bookings (
    datetime TIMESTAMPTZ NOT NULL,
    room VARCHAR(5) NOT NULL,
    cn VARCHAR(10) NOT NULL,
    PRIMARY KEY(datetime, room)
);

CREATE TABLE admins (
    cn VARCHAR(10) PRIMARY KEY NOT NULL
);
