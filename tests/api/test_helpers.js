import { useSession, getSession } from 'next-auth/react';
import { addDaysToDate, getToday } from '../../lib/helpers';

// XXX: the jest.mock() needs to be called in any file that imports mockUser!
// jest.mock("next-auth/react");

export const mockUserOnce = (mockUserDetails) => {
  const originalModule = jest.requireActual('next-auth/react');
  const mockSession = {
    user: mockUserDetails,
    expires: new Date(Date.now() + 2 * 86400).toISOString()
  };

  useSession.mockReturnValueOnce(
    mockUserDetails
      ? ({ data: mockSession, status: 'authenticated' })
      : originalModule.useSession
  );
  getSession.mockReturnValueOnce(
    mockUserDetails
      ? mockSession
      : originalModule.getSession
  );
};

export const users = {
  admin: {
    email: 'admin@ucl.ac.uk',
    fullName: 'Admin',
    isAdmin: true,
    image: ''
  }, nonAdmin: {
    email: 'non-admin@ucl.ac.uk',
    fullName: 'Non admin',
    isAdmin: false,
    image: ''
  }
};

export const rooms = [{
  name: 'A',
  capacity: 10,
  active: true,
}, {
  name: 'B',
  capacity: 10,
  active: true,
}, {
  name: 'C',
  capacity: 2,
  active: false,
}];

export const bookings = [{
  id: 'test',
  roomName: rooms[0].name,
  datetime: addDaysToDate(getToday(), 2).toISOString(),
  email: users.admin.email
}, {
  id: 'test1',
  roomName: rooms[0].name,
  datetime: new Date('2022-01-02').toISOString(),
  email: users.nonAdmin.email
}];
