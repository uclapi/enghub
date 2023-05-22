import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { addDaysToDate, getToday } from '../../lib/helpers';

// XXX: the jest.mock() needs to be called in any file that imports mockUser!
// jest.mock("next-auth/react");

export const mockUserOnce = (mockUserDetails) => {
  const originalModule = jest.requireActual('next-auth/react');
  const originalModule2 = jest.requireActual('next-auth');
  const mockSession = {
    user: mockUserDetails,
    expires: new Date(Date.now() + 2 * 86400).toISOString()
  };

  useSession.mockReturnValueOnce(
    mockUserDetails
      ? ({ data: mockSession, status: 'authenticated' })
      : originalModule.useSession
  );
  getServerSession.mockReturnValueOnce(
    mockUserDetails ? mockSession : originalModule2.getServerSession
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
  }, admin2: {
    email: 'admin-2@ucl.ac.uk',
    fullName: 'Admin 2',
    isAdmin: true,
    image: ''
  }
};

export const rooms = [{
  name: 'A',
  capacity: 10,
  active: true,
  id: 11,
  book_by_seat: false,
}, {
  name: 'B',
  capacity: 10,
  active: true,
  id: 12,
  book_by_seat: false,
}, {
  name: 'C',
  capacity: 2,
  active: false,
  id: 13,
  book_by_seat: true,
}, {
  name: 'D',
  capacity: 2,
  active: true,
  id: 14,
  book_by_seat: true,
}, {
  name: 'E',
  capacity: 2,
  active: true,
  id: 15,
  book_by_seat: false,
}];

export const bookings = [{
  id: 'test',
  roomName: rooms[0].name,
  roomId: rooms[0].id,
  datetime: addDaysToDate(getToday(), 2).toISOString(),
  email: users.admin.email
}, {
  id: 'test1',
  roomName: rooms[0].name,
  roomId: rooms[0].id,
  datetime: new Date('2022-01-02').toISOString(),
  email: users.nonAdmin.email
}];
