import { createMocks } from 'node-mocks-http';
import handleRoom from '../../pages/api/rooms/[roomId]';
import { PrismaClient } from "@prisma/client";
import { mockUserOnce, users } from './test_helpers.js';
jest.mock("next-auth/react");
jest.mock("next-auth");

const prisma = new PrismaClient();
afterAll(async () => { await prisma.$disconnect(); });

describe('PUT /api/rooms', () => {
  test('admins can update existing rooms', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'PUT',
      body: { capacity: 100, active: true },
      query: { roomId: 1 }
    });
    await handleRoom(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ error: false });

    const newRoom = await prisma.enghub_rooms.findFirst({ where: { id: 1 } });
    expect(newRoom).toBeTruthy();
    expect(newRoom.active).toEqual(true);
    expect(newRoom.capacity).toEqual(100);
  });

  test('rejects invalid room information', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'PUT',
      body: { capacity: -1 },
      query: { roomId: 1 }
    });
    await handleRoom(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('rejects non-existent room', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'PUT',
      body: { capacity: 10 },
      query: { roomId: 100 }
    });
    await handleRoom(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  test('redirects if not logged in', async () => {
    const { req, res } = createMocks({ method: 'PUT' });
    await handleRoom(req, res);
    expect(res._getStatusCode()).toBe(302);
  });

  test('non-admins cannot edit/create rooms', async () => {
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({ method: 'PUT' });
    await handleRoom(req, res);
    expect(res._getStatusCode()).toBe(403);
  });
});
