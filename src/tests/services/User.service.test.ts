/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonDB } from 'node-json-db';

import { RsaKeys, User } from '../../types';
import { UserService } from '../../services/User.service';

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

  describe('getUserIndex', () => {
    it('should return undefined when user not found', () => {
      const mockGetIndex = jest.fn().mockReturnValue(-1);

      (UserService as any)._db = ({
        getIndex: mockGetIndex,
      } as unknown) as JsonDB;

      const result = UserService.getUserIndex('foo@mail.com');

      expect(result).toBe<undefined>(undefined);
      expect(mockGetIndex).toBeCalledWith<[string, string, string]>(
        '/users',
        'foo@mail.com',
        'email'
      );
    });

    it('should return user index when user found', () => {
      const mockGetIndex = jest.fn().mockReturnValue(2);

      (UserService as any)._db = ({
        getIndex: mockGetIndex,
      } as unknown) as JsonDB;

      const result = UserService.getUserIndex('foo@mail.com');

      expect(result).toBe<number>(2);
      expect(mockGetIndex).toBeCalledWith<[string, string, string]>(
        '/users',
        'foo@mail.com',
        'email'
      );
    });
  });

  describe('saveUserRsaKeys', () => {
    const mockRsaKeys: RsaKeys = {
      privateKey: 'private_key',
      publicKey: 'public_key',
    };
    const userEmail = 'admin@mail.com';

    it('should throw an error when no user found with passed email', () => {
      const mockGetUserIndex = jest.fn().mockReturnValue(undefined);
      const mockPush = jest.fn();

      UserService.getUserIndex = mockGetUserIndex;

      (UserService as any)._db = ({
        push: mockPush,
      } as unknown) as JsonDB;

      try {
        UserService.saveUserRsaKeys(userEmail, mockRsaKeys);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err).toHaveProperty('message', 'User does not exist');
        expect(mockPush).not.toBeCalled();
      }
    });

    it('should save user keys', () => {
      const mockGetUserIndex = jest.fn().mockReturnValue(1);
      const mockPush = jest.fn();

      UserService.getUserIndex = mockGetUserIndex;

      (UserService as any)._db = ({
        push: mockPush,
      } as unknown) as JsonDB;

      UserService.saveUserRsaKeys(userEmail, mockRsaKeys);

      expect(mockGetUserIndex).toBeCalledWith<[string]>(userEmail);
      expect(mockPush).toBeCalledWith<[string, { rsaKeys: RsaKeys }, boolean]>(
        '/users[1]',
        { rsaKeys: mockRsaKeys },
        false
      );
    });
  });
});
