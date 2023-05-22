
import { createMocks } from 'node-mocks-http';
import handleAdmins from '../../pages/api/admins';
import { PrismaClient } from "@prisma/client";
import { mockUserOnce, users } from './test_helpers';
jest.mock("next-auth/react");
jest.mock("next-auth");
const prisma = new PrismaClient();
afterAll(async () => { await prisma.$disconnect(); });

describe('/api/admins', () => {
  test('admins can create new admins', async () => {
    mockUserOnce(users.admin);
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
    mockUserOnce(users.nonAdmin);
    const { req, res } = createMocks({ method: 'POST' });
    await handleAdmins(req, res);
    expect(res._getStatusCode()).toBe(403);
  });
});
