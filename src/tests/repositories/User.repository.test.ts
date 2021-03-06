/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonDB } from 'node-json-db';

import { RsaKeys, User } from '~types';
import { UserRepository } from '~repositories/User.repository';
import { HttpException } from '~common';

describe('UserRepository', () => {
  describe('getUserIndex', () => {
    it('should throw an error when user not found', () => {
      const mockGetIndex = jest.fn().mockReturnValue(-1);

      (UserRepository as any)._db = ({
        getIndex: mockGetIndex,
      } as unknown) as JsonDB;

      try {
        UserRepository.getUserIndex('foo@mail.com');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err).toHaveProperty<number>('statusCode', 404);
        expect(err).toHaveProperty<string>('message', 'User not found');
        expect(mockGetIndex).toBeCalledWith<[string, string, string]>(
          '/users',
          'foo@mail.com',
          'email'
        );
      }
      mockGetIndex.mockRestore();
    });

    it('should return user index when user found', () => {
      const mockGetIndex = jest.fn();

      (UserRepository as any)._db = ({
        getIndex: mockGetIndex.mockImplementation(() => 2),
      } as unknown) as JsonDB;

      const result = UserRepository.getUserIndex('foo@mail.com');

      expect(result).toBe<number>(2);
      expect(mockGetIndex).toBeCalledWith<[string, string, string]>(
        '/users',
        'foo@mail.com',
        'email'
      );
      mockGetIndex.mockRestore();
    });
  });

  describe('getUserByEmail', () => {
    it('should throw an error if no user was found', () => {
      const mockGetUserIndex = jest.fn().mockImplementation(() => {
        throw new HttpException(404, 'User not found');
      });

      const mockGetData = jest.fn();

      UserRepository.getUserIndex = mockGetUserIndex;

      (UserRepository as any)._db = ({
        getData: mockGetData,
      } as unknown) as JsonDB;

      try {
        UserRepository.getUserByEmail('foo@mail.com');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err).toHaveProperty<number>('statusCode', 404);
        expect(err).toHaveProperty<string>('message', 'User not found');
        expect(mockGetData).not.toBeCalled();
        expect(mockGetUserIndex).toBeCalledWith<[string]>('foo@mail.com');
      }
      mockGetUserIndex.mockRestore();
      mockGetData.mockRestore();
    });

    it('should return user', () => {
      const expectedUser: User = {
        email: 'foo@mail.com',
        password: 'hashed_password',
      };

      const mockGetUserIndex = jest.fn().mockReturnValue(1);
      const mockGetData = jest.fn();

      UserRepository.getUserIndex = mockGetUserIndex;

      (UserRepository as any)._db = ({
        getData: mockGetData.mockReturnValue(expectedUser),
      } as unknown) as JsonDB;

      const user = UserRepository.getUserByEmail('foo@mail.com');

      expect(user).toBe<User>(expectedUser);
      expect(mockGetUserIndex).toBeCalledWith<[string]>('foo@mail.com');
      expect(mockGetData).toBeCalledWith('/users[1]');
      mockGetUserIndex.mockRestore();
      mockGetData.mockRestore();
    });
  });

  describe('saveUserRsaKeys', () => {
    const mockRsaKeys: RsaKeys = {
      publicKey: 'public_key',
    };
    const userEmail = 'admin@mail.com';

    it('should throw an error when no user found with passed email', () => {
      const mockGetUserIndex = jest.fn().mockReturnValue(undefined);
      const mockPush = jest.fn();

      UserRepository.getUserIndex = mockGetUserIndex;

      (UserRepository as any)._db = ({
        push: mockPush,
      } as unknown) as JsonDB;

      try {
        UserRepository.saveUserRsaKeys(userEmail, mockRsaKeys);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err).toHaveProperty('message', 'User does not exist');
        expect(mockPush).not.toBeCalled();
      }
      mockGetUserIndex.mockRestore();
      mockPush.mockRestore();
    });

    it('should save user keys', () => {
      const mockGetUserIndex = jest.fn().mockReturnValue(1);
      const mockPush = jest.fn();

      UserRepository.getUserIndex = mockGetUserIndex;

      (UserRepository as any)._db = ({
        push: mockPush,
      } as unknown) as JsonDB;

      UserRepository.saveUserRsaKeys(userEmail, mockRsaKeys);

      expect(mockGetUserIndex).toBeCalledWith<[string]>(userEmail);
      expect(mockPush).toBeCalledWith<[string, { rsaKeys: RsaKeys }, boolean]>(
        '/users[1]',
        { rsaKeys: mockRsaKeys },
        false
      );

      mockGetUserIndex.mockRestore();
      mockPush.mockRestore();
    });
  });
  describe('getUserPublicKey', () => {
    it('should throw an error when user does not exist', () => {
      const mockGetUserIndex = jest.fn().mockImplementation(() => {
        throw new HttpException(404, 'User not found');
      });

      UserRepository.getUserIndex = mockGetUserIndex;

      const mockGetData = jest.fn();

      (UserRepository as any)._db = ({
        getData: mockGetData,
      } as unknown) as JsonDB;

      try {
        UserRepository.getUserPublicKey('foo@mail.com');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err).toHaveProperty<number>('statusCode', 404);
        expect(err).toHaveProperty<string>('message', 'User not found');
        expect(mockGetUserIndex).toBeCalledWith<[string]>('foo@mail.com');
        expect(mockGetData).not.toBeCalled();
      }
      mockGetUserIndex.mockRestore();
      mockGetData.mockRestore();
    });

    it('should return public key', () => {
      const mockRsaKeys: RsaKeys = {
        publicKey: 'pub_key',
      };
      const mockGetUserIndex = jest.fn().mockReturnValue(2);

      UserRepository.getUserIndex = mockGetUserIndex;

      const mockGetData = jest.fn();

      (UserRepository as any)._db = ({
        getData: mockGetData.mockReturnValue({ rsaKeys: mockRsaKeys }),
      } as unknown) as JsonDB;

      const result = UserRepository.getUserPublicKey('foo@mail.com');
      expect(result).toBe<string>('pub_key');
      expect(mockGetUserIndex).toBeCalledWith<[string]>('foo@mail.com');
      expect(mockGetData).toBeCalledWith<[string]>('/users[2]');
      mockGetUserIndex.mockRestore();
      mockGetData.mockRestore();
    });
  });
});
