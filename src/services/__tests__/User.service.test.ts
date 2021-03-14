/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonDB } from 'node-json-db';

import { User } from '../../types';
import { UserService } from '../User.service';

describe('UserService', () => {
  describe('getUserByEmail', () => {
    it('should return undefined if no user was found', () => {
      const mockGetIndex = jest.fn().mockReturnValue(-1);

      (UserService as any)._db = ({
        getIndex: mockGetIndex,
      } as unknown) as JsonDB;

      const user = UserService.getUserByEmail('foo@mail.com');

      expect(user).toBe(undefined);
      expect(mockGetIndex).toBeCalledWith('/users', 'foo@mail.com', 'email');
    });

    it('should return user', () => {
      const expectedUser: User = {
        email: 'foo@mail.com',
        password: 'hashed_password',
      };

      const mockGetIndex = jest.fn().mockReturnValue(1);
      const mockGetData = jest.fn().mockReturnValue(expectedUser);

      (UserService as any)._db = ({
        getIndex: mockGetIndex,
        getData: mockGetData,
      } as unknown) as JsonDB;

      const user = UserService.getUserByEmail('foo@mail.com');

      expect(user).toBe(expectedUser);
      expect(mockGetIndex).toBeCalledWith('/users', 'foo@mail.com', 'email');
      expect(mockGetData).toBeCalledWith('/users[1]');
    });
  });

  describe('saveUser', () => {
    it('should throw an error', () => {
      try {
        const user = new UserService();

        user.saveUser();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toMatch(/not implemented/i);
      }
    });
  });
});
