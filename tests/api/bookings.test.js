
import { createMocks } from 'node-mocks-http';
import handleBookings from '../../pages/api/bookings/index';
import { PrismaClient } from "@prisma/client";
import { mockUserOnce, users, bookings, rooms } from './test_helpers';
import { getToday, addDaysToDate } from '../../lib/helpers';
jest.mock("next-auth/react");
jest.mock("next-auth");

const prisma = new PrismaClient();
afterAll(async () => { await prisma.$disconnect(); });

describe('GET /api/bookings', () => {
  test('must provide date', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({ method: 'GET' });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('non-admins can get bookings excluding name of booker', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({
      method: 'GET',
      query: { date: bookings[0].datetime, buildingId: 1 }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      bookings: {
        [bookings[0].roomId]: [
          { ...bookings[0], isOwner: false, fullName: null, email: null }
        ]
      }
    });
  });

  test('admins can get bookings including name of booker', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'GET',
      query: { date: bookings[0].datetime, buildingId: 1 }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      bookings: {
        [bookings[0].roomId]: [
          { ...bookings[0], isOwner: true, fullName: users.admin.fullName, email: users.admin.email }
        ]
      }
    });
  });

  test('non-admins cannot view past bookings', async () => {
    mockUserOnce(users.nonAdmin);
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const { req, res } = createMocks({
      method: 'GET',
      query: { date: date.toISOString(), buildingId: 1 }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(403);
  });

  test('non-admins cannot view future bookings past 7 days', async () => {
    mockUserOnce(users.nonAdmin);
    const date = new Date();
    date.setDate(date.getDate() + 8);
    const { req, res } = createMocks({
      method: 'GET',
      query: { date: date.toISOString(), buildingId: 1 }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(403);
  });

  test('admins can view past bookings', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'GET',
      query: { date: bookings[1].datetime, buildingId: 1 }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      bookings: {
        [bookings[1].roomId]: [
          { ...bookings[1], isOwner: false, fullName: users.nonAdmin.fullName, email: users.nonAdmin.email }
        ]
      }
    });
  });

  test('admins can view future bookings past 7 days', async () => {
    mockUserOnce(users.admin);
    const date = new Date();
    date.setDate(date.getDate() + 8);
    const { req, res } = createMocks({
      method: 'GET',
      query: { date: date.toISOString(), buildingId: 1 }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ bookings: {} });
  });

  test('must provide building ID', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'GET',
      query: { date: new Date().toISOString() }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('redirects if not logged in', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(302);
  });
});

/**
 * multiple people can't book same slot
 */
describe('POST /api/bookings', () => {
  test('admins can book >3 slots a week', async () => {
    const date = addDaysToDate(getToday(), 1);
    date.setHours(8);
    for (let i = 0; i < 4; i++) {
      mockUserOnce(users.admin);
      date.setHours(date.getHours() + 1);
      const { req, res } = createMocks({
        method: 'POST',
        body: { datetime: date.toISOString(), room_id: rooms[0].id }
      });
      await handleBookings(req, res);
      expect(res._getStatusCode()).toBe(200);
    }

    expect(await prisma.enghub_bookings.count({
      where: {
        datetime: { gte: addDaysToDate(getToday(), 1), lte: date },
        email: users.admin.email,
      }
    })).toEqual(4);
  });

  test('non-admins cannot book >3 slots a week', async () => {
    const date = addDaysToDate(getToday(), 1);
    date.setHours(8);

    for (let i = 0; i < 3; i++) {
      mockUserOnce(users.nonAdmin);
      date.setHours(date.getHours() + 1);
      const { req, res } = createMocks({
        method: 'POST',
        body: { datetime: date.toISOString(), room_id: rooms[1].id }
      });
      await handleBookings(req, res);
      expect(res._getStatusCode()).toBe(200);
    }

    mockUserOnce(users.nonAdmin);
    date.setHours(date.getHours() + 1);
    const { req, res } = createMocks({
      method: 'POST',
      body: { datetime: date.toISOString(), room_id: rooms[1].id }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(403);

    expect(await prisma.enghub_bookings.count({
      where: {
        datetime: { gte: addDaysToDate(getToday(), 1), lte: date },
        email: users.nonAdmin.email,
      }
    })).toEqual(3);
  });

  test('admins can book >7 days in advance', async () => {
    const date = addDaysToDate(getToday(), 8);
    date.setHours(8);

    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'POST',
      body: { datetime: date.toISOString(), room_id: rooms[0].id }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(200);

    expect(await prisma.enghub_bookings.count({
      where: { datetime: date, email: users.admin.email }
    })).toEqual(1);
  });

  test('non-admins cannot book >7 days in advance', async () => {
    const date = addDaysToDate(getToday(), 8);
    date.setHours(8);

    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({
      method: 'POST',
      body: { datetime: date.toISOString(), room_id: rooms[0].id }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(403);
  });

  test('cannot book room in past', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({
      method: 'POST',
      body: { datetime: bookings[1].datetime, room_id: bookings[1].roomId }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('cannot book inactive room', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({
      method: 'POST',
      body: { datetime: bookings[1].datetime, room_id: rooms[2].id }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('must provide date/time', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({ method: 'POST' });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('cannot have slot collision when !book_by_seat', async () => {
    const date = addDaysToDate(getToday(), 1);
    date.setHours(8);

    mockUserOnce(users.admin);
    date.setHours(date.getHours() + 1);
    const { req, res } = createMocks({
      method: 'POST',
      body: { datetime: date.toISOString(), room_id: rooms[1].id }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(403);
  });

  test('can book multiple slots when book_by_seat', async () => {
    const date = addDaysToDate(getToday(), 1);
    date.setHours(8);

    mockUserOnce(users.admin);
    date.setHours(date.getHours() + 1);
    const { req, res } = createMocks({
      method: 'POST',
      body: { datetime: date.toISOString(), room_id: rooms[3].id }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(200);

    mockUserOnce(users.admin2);
    const { req: req2, res: res2 } = createMocks({
      method: 'POST',
      body: { datetime: date.toISOString(), room_id: rooms[3].id }
    });
    await handleBookings(req2, res2);
    expect(res2._getStatusCode()).toBe(200);
  });

  test('must book valid slot', async () => {
    const date = addDaysToDate(getToday(), 1);
    date.setHours(2);
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({
      method: 'POST',
      body: { datetime: date.toISOString(), room_id: rooms[1].id }
    });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('redirects if not logged in', async () => {
    const { req, res } = createMocks({ method: 'POST' });
    await handleBookings(req, res);
    expect(res._getStatusCode()).toBe(302);
  });
});
