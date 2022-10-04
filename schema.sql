CREATE TABLE enghub_users (
    email VARCHAR(100) PRIMARY KEY NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE enghub_rooms (
    name VARCHAR(6) PRIMARY KEY NOT NULL,
    capacity INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    admin_only BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE enghub_bookings (
    id VARCHAR(20) PRIMARY KEY NOT NULL,
    datetime TIMESTAMPTZ NOT NULL,
    room_name VARCHAR(5) NOT NULL REFERENCES enghub_rooms(name),
    email VARCHAR(100) NOT NULL REFERENCES enghub_users(email)
);

INSERT INTO enghub_rooms (name, capacity) VALUES ('G02', 10), ('G03', 10), ('211', 10), ('212', 10);
INSERT INTO enghub_rooms (name, capacity, active) VALUES ('213', 10, FALSE);
