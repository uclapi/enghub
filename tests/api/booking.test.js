import { createMocks } from 'node-mocks-http';
import handleBooking from '../../pages/api/bookings/[bookingId]';
import { PrismaClient } from "@prisma/client";
import { mockUserOnce, bookings, users } from './test_helpers';
jest.mock("next-auth/react");

const prisma = new PrismaClient();
afterAll(async () => { await prisma.$disconnect(); });

describe('DELETE /api/bookings/:id', () => {
  test('must provide booking ID', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({
      method: 'DELETE',
    });
    await handleBooking(req, res);
    expect(res._getStatusCode()).toBe(404);
  });

  test('booking must exist', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'DELETE',
      query: { bookingId: 'foo' }
    });
    await handleBooking(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('cannot cancel booking from past', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({
      method: 'DELETE',
      query: { bookingId: bookings[1].id }
    });
    await handleBooking(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('can cancel upcoming booking', async () => {
    mockUserOnce(users.admin);
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
    mockUserOnce(users.admin);
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
