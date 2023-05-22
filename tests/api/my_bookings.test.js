import { createMocks } from 'node-mocks-http';
import handleMyBookings from '../../pages/api/my_bookings';
import { mockUserOnce, users } from './test_helpers';
jest.mock("next-auth/react");
jest.mock("next-auth");

describe('/api/my_bookings', () => {
  test('returns bookings for logged in user', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({ method: 'GET' });
    await handleMyBookings(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).bookings.length > 0);
  });

  test('redirects if not logged in', async () => {
    const { req, res } = createMocks({ method: 'GET' });

    await handleMyBookings(req, res);
    expect(res._getStatusCode()).toBe(302);
  });
});
