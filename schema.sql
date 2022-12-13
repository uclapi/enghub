CREATE TABLE enghub_users (
    email VARCHAR(100) PRIMARY KEY NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE enghub_buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE enghub_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(6) NOT NULL,
    building_id INTEGER NOT NULL REFERENCES enghub_buildings(id),
    description VARCHAR(200),
    restricted_to_group VARCHAR(20),
    capacity INTEGER DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    admin_only BOOLEAN DEFAULT FALSE NOT NULL,
    book_by_seat BOOLEAN DEFAULT TRUE NOT NULL -- some rooms are bookable in their entirety; some are bookable per-seat
);

CREATE TABLE enghub_rooms_user_whitelist (
    email VARCHAR(100),
    room_id INTEGER REFERENCES enghub_rooms(id),
    PRIMARY KEY (email, room_id)
);

CREATE TABLE enghub_bookings (
    id VARCHAR(20) PRIMARY KEY NOT NULL,
    datetime TIMESTAMPTZ NOT NULL,
    room_id INTEGER NOT NULL REFERENCES enghub_rooms(id),
    email VARCHAR(100) NOT NULL REFERENCES enghub_users(email)
);

INSERT INTO enghub_buildings (id, name) VALUES (1, 'Henry Morley Building'), (2, 'Roberts Building');
INSERT INTO enghub_rooms (id, name, capacity, building_id, book_by_seat) VALUES (1, 'G02', 10, 1, FALSE), (2, 'G03', 10, 1, FALSE), (3, '211', 10, 1, FALSE), (4, '212', 10, 1, FALSE), (5, '105A', 5, 2, TRUE);
INSERT INTO enghub_rooms (id, name, capacity, active, building_id, book_by_seat) VALUES (6, '213', 10, FALSE, 1, FALSE);
