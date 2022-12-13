import { createMocks } from 'node-mocks-http';
import handleRoom from '../../pages/api/rooms/[roomName]';
import { PrismaClient } from "@prisma/client";
import { mockUserOnce, users } from './test_helpers.js';
jest.mock("next-auth/react");

const prisma = new PrismaClient();
afterAll(async () => { await prisma.$disconnect(); });

describe('/api/rooms', () => {
  test('admins can create new rooms', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'PUT',
      body: { capacity: 10 },
      query: { roomName: 'Test' }
    });
    await handleRoom(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ error: false });

    const newRoom = await prisma.enghub_rooms.findFirst({ where: { name: 'Test' } });
    expect(newRoom).toBeTruthy();
    expect(newRoom.active).toEqual(false);
    expect(newRoom.capacity).toEqual(10);
  });

  test('admins can update existing rooms', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'PUT',
      body: { capacity: 1, active: false },
      query: { roomName: 'Test' }
    });
    await handleRoom(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ error: false });

    const newRoom = await prisma.enghub_rooms.findFirst({ where: { name: 'Test' } });
    expect(newRoom).toBeTruthy();
    expect(newRoom.active).toEqual(false);
    expect(newRoom.capacity).toEqual(1);
  });

  test('rejects invalid room information', async () => {
    mockUserOnce(users.admin);
    const { req, res } = createMocks({
      method: 'PUT',
      body: { capacity: -1 },
      query: { roomName: 'A' }
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
