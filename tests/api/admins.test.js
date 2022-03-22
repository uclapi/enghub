
import { createMocks } from 'node-mocks-http';
import handleAdmins from '../../pages/api/admins';
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

beforeAll(async () => {
  await prisma.enghub_users.createMany({
    data: users.map(u => ({
      full_name: u.fullName,
      email: u.email,
      is_admin: u.isAdmin,
    }))
  });
});

afterAll(async () => {
  await prisma.enghub_users.deleteMany();
  await prisma.$disconnect();
});

describe('/api/admins', () => {
  test('admins can create new admins', async () => {
    mockUserOnce(users[0]);
    const newEmail = 'new-admin@ucl.ac.uk';
    const { req, res } = createMocks({
      method: 'POST', body: { email: newEmail }
    });
    await handleAdmins(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ error: false });
    const newAdmin = await prisma.enghub_users.findFirst({ where: { email: newEmail } });
    expect(newAdmin).toBeTruthy();
    expect(newAdmin.email).toEqual(newEmail);
    expect(newAdmin.is_admin).toEqual(true);
  });

  test('redirects if not logged in', async () => {
    const { req, res } = createMocks({ method: 'POST' });
    await handleAdmins(req, res);
    expect(res._getStatusCode()).toBe(302);
  });

  test('non-admins cannot create new admins', async () => {
    mockUserOnce(users[1]);
    const { req, res } = createMocks({ method: 'POST' });
    await handleAdmins(req, res);
    expect(res._getStatusCode()).toBe(403);
  });
});
