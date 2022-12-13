import { createMocks } from 'node-mocks-http';
import handleRooms from '../../pages/api/rooms/index';
import { mockUserOnce, users, } from './test_helpers';
jest.mock("next-auth/react");

describe('/api/rooms', () => {
  test('admins can get all rooms', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({ method: 'GET' });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).rooms.find(r => !r.active)).toBeTruthy();
  });

  test('redirects if not logged in', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(302);
  });

  test('non-admins can only get active rooms', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({ method: 'GET' });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).rooms.find(r => !r.active)).toBeFalsy();
  });
});
