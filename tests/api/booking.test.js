import { createMocks } from 'node-mocks-http';
import handleBooking from '../../pages/api/bookings/[bookingId]';
import { PrismaClient } from "@prisma/client";
import { mockUserOnce } from './test_helpers';
import { addDaysToDate } from '../../lib/helpers';
jest.mock("next-auth/react");

const prisma = new PrismaClient();

const users = [{
  email: 'zxx@ucl.ac.uk',
  fullName: 'User1',
  isAdmin: false,
  image: ''
}, {
  email: 'xxx@ucl.ac.uk',
  fullName: 'User2',
  isAdmin: false,
  image: ''
}];

const rooms = [{
  name: 'Room',
  capacity: 10,
  active: true,
}];

const bookings = [{
  id: 'test',
  roomName: rooms[0].name,
  datetime: addDaysToDate(new Date(), 1).toISOString(),
  email: users[0].email
}, {
  id: 'test1',
  roomName: rooms[0].name,
  datetime: new Date('2022-01-02').toISOString(),
  email: users[1].email
}];

beforeAll(async () => {
  await prisma.enghub_users.createMany({
    data: users.map(u => ({
      full_name: u.fullName,
      email: u.email,
      is_admin: u.isAdmin,
    }))
  });
  await prisma.enghub_rooms.createMany({ data: rooms });
  await prisma.enghub_bookings.createMany({
    data: bookings.map(b => ({
      id: b.id, room_name: b.roomName, datetime: b.datetime, email: b.email,
    }))
  });
});

afterAll(async () => {
  await prisma.enghub_bookings.deleteMany();
  await prisma.enghub_rooms.deleteMany();
  await prisma.enghub_users.deleteMany();
  await prisma.$disconnect();
});

describe('DELETE /api/bookings/:id', () => {
  test('must provide booking ID', async () => {
    mockUserOnce(users[1]);
    const { req, res } = createMocks({
      method: 'DELETE',
    });
    await handleBooking(req, res);
    expect(res._getStatusCode()).toBe(404);
  });

  test('booking must exist', async () => {
    mockUserOnce(users[0]);
    const { req, res } = createMocks({
      method: 'DELETE',
      query: { bookingId: 'foo' }
    });
    await handleBooking(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('cannot cancel booking from past', async () => {
    mockUserOnce(users[1]);
    const { req, res } = createMocks({
      method: 'DELETE',
      query: { bookingId: bookings[1].id }
    });
    await handleBooking(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('can cancel upcoming booking', async () => {
    mockUserOnce(users[0]);
    const { req, res } = createMocks({
      method: 'DELETE',
      query: { bookingId: bookings[0].id }
    });
    await handleBooking(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(await prisma.enghub_bookings.count({
      where: { datetime: bookings[0].datetime }
    })).toEqual(0);
  });

  test('cannot cancel booking for another user', async () => {
    mockUserOnce(users[0]);
    const { req, res } = createMocks({
      method: 'DELETE',
      query: { bookingId: bookings[1].id }
    });
    await handleBooking(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('redirects if not logged in', async () => {
    const { req, res } = createMocks({ method: 'DELETE' });
    await handleBooking(req, res);
    expect(res._getStatusCode()).toBe(302);
  });
});
