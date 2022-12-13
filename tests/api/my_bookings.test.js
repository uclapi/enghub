import { createMocks } from 'node-mocks-http';
import handleMyBookings from '../../pages/api/my_bookings';
import { mockUserOnce, users, bookings } from './test_helpers';
jest.mock("next-auth/react");

describe('/api/my_bookings', () => {
  test('returns bookings for logged in user', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({ method: 'GET' });
    await handleMyBookings(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      {
        bookings: bookings
          .filter(b => b.email === users.nonAdmin.email)
          .map(b => ({ datetime: b.datetime, id: b.id, room_name: b.roomName }))
      }
    );
  });

  test('redirects if not logged in', async () => {
    const { req, res } = createMocks({ method: 'GET' });

    await handleMyBookings(req, res);
    expect(res._getStatusCode()).toBe(302);
  });
});
