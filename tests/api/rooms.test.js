import { createMocks } from 'node-mocks-http';
import handleRooms from '../../pages/api/rooms/index';
import { PrismaClient } from "@prisma/client";
import { mockUserOnce, users, } from './test_helpers';
jest.mock("next-auth/react");

const prisma = new PrismaClient();
afterAll(async () => { await prisma.$disconnect(); });

describe('GET /api/rooms', () => {
  test('admins can get all rooms', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'GET',
      query: { buildingId: 1 },
    });
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
    const { req, res } = createMocks({
      method: 'GET',
      query: { buildingId: 1 },
    });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).rooms.find(r => !r.active)).toBeFalsy();
  });

  test('must provide building ID', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({ method: 'GET' });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(422);
  });
});

describe('POST /api/rooms', () => {
  test('admins can create new rooms', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'POST',
      body: { name: 'Test', building_id: 1 }
    });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ error: false });

    const newRoom = await prisma.enghub_rooms.findFirst({ where: { name: 'Test' } });
    expect(newRoom).toBeTruthy();
    expect(newRoom.active).toEqual(false);
    expect(newRoom.capacity).toEqual(0);
  });

  test('non-admins cannot create new rooms', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({
      method: 'POST',
      body: { name: 'Test', building_id: 1 }
    });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(403);
  });

  test('must provide name/building ID', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({
      method: 'POST',
    });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(422);
  });
});
