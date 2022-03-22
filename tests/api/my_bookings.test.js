import { createMocks } from 'node-mocks-http';
import handleMyBookings from '../../pages/api/my_bookings';
import { PrismaClient } from "@prisma/client";
import { mockUserOnce } from './test_helpers';
jest.mock("next-auth/react");

const prisma = new PrismaClient();

const user = {
  email: 'zxx@ucl.ac.uk',
  fullName: 'Test Name',
  isAdmin: false,
  image: ''
};
const booking = {
  id: 'test',
  roomName: 'Test',
  datetime: new Date().toISOString(),
};

beforeAll(async () => {
  await prisma.enghub_users.create({
    data: {
      full_name: user.fullName,
      email: user.email,
      is_admin: user.isAdmin,
    }
  });
  await prisma.enghub_rooms.create({
    data: {
      name: booking.roomName,
      capacity: 10,
      active: true,
    },
  });
  await prisma.enghub_bookings.create({
    data: {
      id: booking.id,
      datetime: booking.datetime,
      email: user.email,
      room_name: booking.roomName,
    },
  });
});

afterAll(async () => {
  await prisma.enghub_bookings.deleteMany();
  await prisma.enghub_rooms.deleteMany();
  await prisma.enghub_users.deleteMany();
  await prisma.$disconnect();
});

describe('/api/my_bookings', () => {
  test('returns bookings for logged in user', async () => {
    mockUserOnce(user);
    const { req, res } = createMocks({ method: 'GET' });
    await handleMyBookings(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      { bookings: [{ datetime: booking.datetime, id: booking.id, room_name: booking.roomName }] }
    );
  });

  test('redirects if not logged in', async () => {
    const { req, res } = createMocks({ method: 'GET' });

    await handleMyBookings(req, res);
    expect(res._getStatusCode()).toBe(302);
  });
});
