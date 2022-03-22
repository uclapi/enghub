
import { createMocks } from 'node-mocks-http';
import handleRooms from '../../pages/api/rooms/index';
import { PrismaClient } from "@prisma/client";
import { mockUserOnce } from './test_helpers';
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
  name: 'Act',
  capacity: 10,
  active: true,
}, {
  name: 'Inact',
  capacity: 10,
  active: false,
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
  test('admins can get all rooms', async () => {
    mockUserOnce(users[0]);
    const { req, res } = createMocks({ method: 'GET' });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ rooms });
  });

  test('redirects if not logged in', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(302);
  });

  test('non-admins can only get active rooms', async () => {
    mockUserOnce(users[1]);
    const { req, res } = createMocks({ method: 'GET' });
    await handleRooms(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ rooms: [rooms[0]] });
  });
});
