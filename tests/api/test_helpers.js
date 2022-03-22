import { useSession, getSession } from 'next-auth/react';

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
