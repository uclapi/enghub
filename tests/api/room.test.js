import { createMocks } from 'node-mocks-http';
import handleRoom from '../../pages/api/rooms/[roomName]';
import { PrismaClient } from "@prisma/client";
import { mockUserOnce } from './test_helpers.js';
jest.mock("next-auth/react");

const prisma = new PrismaClient();

const users = [{
  email: 'zxx@ucl.ac.uk',
  fullName: 'Admin',
  isAdmin: true,
  image: ''
}, {
  email: 'xxx@ucl.ac.uk',
  fullName: 'Non admin',
  isAdmin: false,
  image: ''
}];

const rooms = [{
  name: 'Room',
  capacity: 10,
  active: true,
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
});

afterAll(async () => {
  await prisma.enghub_rooms.deleteMany();
  await prisma.enghub_users.deleteMany();
  await prisma.$disconnect();
});

describe('/api/rooms', () => {
  test('admins can create new rooms', async () => {
    mockUserOnce(users[0]);
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
    mockUserOnce(users[0]);
    const { req, res } = createMocks({
      method: 'PUT',
      body: { capacity: 1, active: false },
      query: { roomName: 'Room' }
    });
    await handleRoom(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ error: false });

    const newRoom = await prisma.enghub_rooms.findFirst({ where: { name: 'Room' } });
    expect(newRoom).toBeTruthy();
    expect(newRoom.active).toEqual(false);
    expect(newRoom.capacity).toEqual(1);
  });

  test('rejects invalid room information', async () => {
    mockUserOnce(users[0]);
    const { req, res } = createMocks({
      method: 'PUT',
      body: { capacity: -1 },
      query: { roomName: 'Room' }
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
    mockUserOnce(users[1]);
    const { req, res } = createMocks({ method: 'PUT' });
    await handleRoom(req, res);
    expect(res._getStatusCode()).toBe(403);
  });
});
